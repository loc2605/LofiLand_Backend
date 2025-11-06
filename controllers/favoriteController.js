import Favorite from "../models/Favorite.js";

export const addToFavorites = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user._id;

    // Kiểm tra xem đã tồn tại hay chưa
    const existing = await Favorite.findOne({ user: userId, song: songId });
    if (existing) {
      return res.status(400).json({ message: "Bài hát đã có trong yêu thích" });
    }

    const favorite = await Favorite.create({ user: userId, song: songId });
    return res.status(201).json(favorite);
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