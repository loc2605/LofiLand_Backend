import Playlist from "../models/Playlist.js";

export const createPlaylist = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    const userId = req.user._id;

    const playlist = await Playlist.create({
      title,
      description,
      user: userId,
      isPublic,
    });

    return res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const getPlaylists = async (req, res) => {
  try {
    const userId = req.user._id;
    const playlists = await Playlist.find({ user: userId });
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};