import Favorite from "../models/Favorite.js";

export const addToFavorites = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user._id;

    const existing = await Favorite.findOne({ user: userId, song: songId });
    if (existing) {
      return res.status(400).json({ message: "Bài hát đã có trong yêu thích" });
    }

    const favorite = await Favorite.create({ user: userId, song: songId });
    return res.status(201).json({
      message: "Đã thêm vào danh sách yêu thích",
      favorite,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const favorites = await Favorite.find({ user: userId }).populate("song");
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

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
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
