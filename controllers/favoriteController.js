import Favorite from "../models/Favorite.js";
import axios from "axios";

/**
 * @desc Thêm bài hát vào danh sách yêu thích
 */
export const addToFavorites = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user._id;

    // Kiểm tra trùng
    const existing = await Favorite.findOne({ user: userId, song: songId });
    if (existing) {
      return res.status(400).json({ message: "Bài hát đã có trong yêu thích" });
    }

    // Lấy chi tiết bài hát từ Deezer API
    let data;
    try {
      const response = await axios.get(`https://api.deezer.com/track/${songId}`);
      data = response.data;
    } catch (err) {
      console.error(`Error fetching song ${songId} from Deezer:`, err.message);
      return res.status(500).json({ message: "Không thể lấy dữ liệu bài hát", error: err.message });
    }

    const favorite = await Favorite.create({
      user: userId,
      song: songId,
      title: data.title,
      artistName: data.artist.name,
      artistAvatar: data.artist.picture_medium || "",
      albumTitle: data.album.title,
      albumCover: data.album.cover_medium || "",
      previewUrl: data.preview,
      fullUrl: data.link,
    });

    // Trả về đúng cấu trúc Song
    const song = {
      id: favorite.song,
      title: favorite.title,
      artist: {
        name: favorite.artistName,
        avatarUrl: favorite.artistAvatar || "https://placehold.co/100",
      },
      album: {
        title: favorite.albumTitle,
        coverUrl: favorite.albumCover || "https://placehold.co/300",
      },
      audioUrl: favorite.previewUrl,
      fullUrl: favorite.fullUrl || "",
    };

    return res.status(201).json({
      success: true,
      message: "Đã thêm vào danh sách yêu thích",
      song,
    });
  } catch (error) {
    console.error("addToFavorites error:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Xoá bài hát khỏi danh sách yêu thích
 */
export const removeFromFavorites = async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user._id;

    const favorite = await Favorite.findOneAndDelete({ user: userId, song: songId });
    if (!favorite) {
      return res.status(404).json({ message: "Bài hát không có trong danh sách yêu thích" });
    }

    res.status(200).json({ success: true, message: "Đã xóa khỏi yêu thích", songId });
  } catch (error) {
    console.error("removeFromFavorites error:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Lấy danh sách bài hát yêu thích của người dùng (trả luôn đúng cấu trúc Song)
 *       — tự động refresh previewUrl từ Deezer nếu cần
 */
export const getFavoriteSongs = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({ user: userId }).sort({ createdAt: -1 }).lean();

    const songs = await Promise.all(
      favorites.map(async (fav) => {
        let previewUrl = fav.previewUrl;

        // Refresh previewUrl từ Deezer nếu cần
        try {
          const { data } = await axios.get(`https://api.deezer.com/track/${fav.song}`);
          previewUrl = data.preview || previewUrl;

          // Update DB nếu khác
          if (previewUrl !== fav.previewUrl) {
            await Favorite.updateOne({ _id: fav._id }, { previewUrl });
          }
        } catch (err) {
          console.error(`Error refreshing previewUrl for song ${fav.song}:`, err.message);
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
          audioUrl: previewUrl,
          fullUrl: fav.fullUrl || "",
        };
      })
    );

    res.status(200).json({
      success: true,
      count: songs.length,
      songs,
    });
  } catch (error) {
    console.error("getFavoriteSongs error:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
