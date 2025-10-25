import Song from "../models/Song.js";

// Lấy tất cả bài hát
export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find()
      .populate("artist", "name avatarUrl")
      .populate("album", "title coverUrl")
      .populate("genre", "name");

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy bài hát theo ID
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("artist", "name avatarUrl")
      .populate("album", "title coverUrl")
      .populate("genre", "name");

    if (!song) {
      return res.status(404).json({ message: "Bài hát không tồn tại" });
    }

    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};