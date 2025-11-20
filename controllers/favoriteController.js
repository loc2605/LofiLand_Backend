import axios from "axios";
import Favorite from "../models/Favorite.js";

/**
 * Deezer Axios instance
 */
const DZ = axios.create({
  baseURL: "https://api.deezer.com",
  timeout: 5000,
});

/**
 * Concurrency pool (giới hạn số request chạy song song)
 */
async function promisePool(tasks, limit = 5) {
  const ret = [];
  const executing = [];

  for (const t of tasks) {
    const p = Promise.resolve().then(t);
    ret.push(p);

    if (limit <= tasks.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);

      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

/**
 * Helper: lấy preview từ Deezer
 */
async function fetchPreview(songId) {
  try {
    const { data } = await DZ.get(`/track/${songId}`);
    return data?.preview || null;
  } catch (err) {
    console.error(`Deezer preview error (${songId}):`, err.response?.data || err.message);
    return null;
  }
}

/**
 * @desc Add to favorites (tự fetch preview nếu null)
 */
export const addToFavorites = async (req, res) => {
  try {
    const songId = req.body?.songId;
    const userId = req.user?._id;

    if (!songId) return res.status(400).json({ message: "songId is required" });

    // Kiểm tra trùng
    const exists = await Favorite.findOne({ user: userId, song: songId });
    if (exists) return res.status(400).json({ message: "Bài hát đã có trong yêu thích" });

    // Lấy track Deezer
    let track;
    try {
      const { data } = await DZ.get(`/track/${songId}`);
      track = data;
    } catch (err) {
      console.error("Deezer track error:", err.message);
      return res.status(500).json({ message: "Không thể lấy dữ liệu bài hát từ Deezer" });
    }

    if (!track || !track.id) return res.status(404).json({ message: "Không tìm thấy bài hát trên Deezer" });

    // Nếu preview null, fetch lại
    let previewUrl = track.preview || "";
    if (!previewUrl) {
      const newPreview = await fetchPreview(track.id);
      if (newPreview) previewUrl = newPreview;
    }

    // Lưu DB
    const fav = await Favorite.create({
      user: userId,
      song: track.id.toString(),
      title: track.title,
      artistName: track.artist?.name,
      artistAvatar: track.artist?.picture_medium || "",
      albumTitle: track.album?.title || "",
      albumCover: track.album?.cover_medium || "",
      previewUrl,
      fullUrl: track.link || "",
    });

    return res.status(201).json({
      success: true,
      message: "Đã thêm vào yêu thích",
      song: {
        id: fav.song,
        title: fav.title,
        artist: {
          name: fav.artistName,
          avatarUrl: fav.artistAvatar || "https://placehold.co/100",
        },
        album: {
          title: fav.albumTitle,
          coverUrl: fav.albumCover || "https://placehold.co/300",
        },
        audioUrl: fav.previewUrl,
        fullUrl: fav.fullUrl,
      },
    });
  } catch (err) {
    console.error("addToFavorites error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @desc Get favorite songs (auto refresh previewUrl nếu cũ hoặc null)
 */
export const getFavoriteSongs = async (req, res) => {
  try {
    const userId = req.user?._id;

    const favorites = await Favorite.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!favorites.length) return res.json({ success: true, songs: [] });

    const tasks = favorites.map((fav) => async () => {
      // Luôn fetch preview mới từ Deezer
      const newPreview = await fetchPreview(fav.song);
      if (newPreview) {
        await Favorite.updateOne({ _id: fav._id }, { previewUrl: newPreview });
      }

      return {
        id: fav.song,
        title: fav.title,
        artist: {
          name: fav.artistName,
          avatarUrl: fav.artistAvatar || "https://placehold.co/100",
        },
        album: {
          title: fav.albumTitle,
          coverUrl: fav.albumCover || "https://placehold.co/300",
        },
        audioUrl: newPreview || "", // trả link mới
        fullUrl: fav.fullUrl || "",
      };
    });

    // Chạy song song tối đa 5 request Deezer
    const songs = await promisePool(tasks, 5);

    return res.json({
      success: true,
      count: songs.length,
      songs,
    });
  } catch (err) {
    console.error("getFavoriteSongs error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


/**
 * @desc Remove from favorites
 */
export const removeFromFavorites = async (req, res) => {
  try {
    const songId = req.params?.songId;
    const userId = req.user?._id;

    if (!songId) return res.status(400).json({ message: "songId is required" });

    const deleted = await Favorite.findOneAndDelete({ user: userId, song: songId });

    if (!deleted) {
      return res.status(404).json({ message: "Không có trong danh sách yêu thích" });
    }

    return res.json({ success: true, message: "Đã xóa khỏi yêu thích", songId });
  } catch (err) {
    console.error("removeFromFavorites error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};