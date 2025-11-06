import Album from "../models/Album.js";

// Lấy tất cả album
export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find().populate("artist", "name avatarUrl");
    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy album theo ID
export const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate("artist", "name avatarUrl");
    if (!album) {
      return res.status(404).json({ message: "Album không tồn tại" });
    }
    res.json(album);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};