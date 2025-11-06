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

export const addSongToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { songId } = req.body;
  const userId = req.user._id;

  try {
    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
      return res.status(404).json({ message: "Playlist không tồn tại hoặc không thuộc về bạn" });
    }

    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: "Bài hát đã có trong playlist" });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.status(200).json({ message: "Đã thêm bài hát vào playlist", playlist });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};