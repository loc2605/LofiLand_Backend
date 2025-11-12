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
    const { data } = await axios.get(`https://api.deezer.com/track/${songId}`);

    const favorite = await Favorite.create({
      user: userId,
      song: songId,
      title: data.title,
      artistName: data.artist.name,
      artistAvatar: data.artist.picture_medium || "",
      albumTitle: data.album.title,
      albumCover: data.album.cover_medium || "",
      previewUrl: data.preview,
    });

    return res.status(201).json({
      message: "Đã thêm vào danh sách yêu thích",
      favorite,
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

    res.status(200).json({ message: "Đã xóa khỏi yêu thích" });
  } catch (error) {
    console.error("removeFromFavorites error:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Lấy danh sách bài hát yêu thích của người dùng (đã đủ để phát nhạc)
 */
export const getFavoriteSongs = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const songs = favorites.map((fav) => ({
      id: fav.song,
      title: fav.title,
      artist: {
        name: fav.artistName,
        avatarUrl: fav.artistAvatar,
      },
      album: {
        title: fav.albumTitle,
        coverUrl: fav.albumCover,
      },
      audioUrl: fav.previewUrl,
    }));

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
