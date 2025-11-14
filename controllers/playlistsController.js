import Playlist from "../models/Playlist.js";
import PlaylistSong from "../models/PlaylistSong.js";
import axios from "axios";

/**
 * @desc Lấy tất cả playlist của user
 */
export const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user._id;
    const playlists = await Playlist.find({ user: userId }).lean();
    const playlistIds = playlists.map(p => p._id);

    // Lấy số lượng bài hát cho mỗi playlist
    const songCounts = await PlaylistSong.aggregate([
      { $match: { playlist: { $in: playlistIds } } },
      { $group: { _id: "$playlist", count: { $sum: 1 } } }
    ]);
    const countMap = {};
    songCounts.forEach(sc => (countMap[sc._id] = sc.count));

    // Lấy 1 bài hát đầu tiên làm cover
    const firstSongs = await PlaylistSong.aggregate([
      { $match: { playlist: { $in: playlistIds } } },
      { $sort: { addedAt: 1 } },
      { $group: { _id: "$playlist", firstSong: { $first: "$$ROOT" } } }
    ]);
    const coverMap = {};
    firstSongs.forEach(fs => { coverMap[fs._id] = fs.firstSong.albumCover || null; });

    const DEFAULT_COVER = "https://picsum.photos/seed/defaultPlaylist/300";

    res.json({
      success: true,
      playlists: playlists.map(p => ({
        _id: p._id,
        title: p.title,
        description: p.description || "",
        cover: coverMap[p._id] || DEFAULT_COVER,
        count: countMap[p._id] || 0,
      })),
    });

  } catch (err) {
    console.error("getUserPlaylists error:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

/**
 * @desc Tạo playlist mới
 */
export const createPlaylist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, isPublic } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Tiêu đề playlist không được để trống" });
    }

    const playlist = await Playlist.create({
      title,
      description: description || "",
      user: userId,
      isPublic: isPublic ?? false,
    });

    res.status(201).json({
      success: true,
      message: "Tạo playlist thành công",
      playlist: {
        _id: playlist._id,
        title: playlist.title,
        description: playlist.description,
        isPublic: playlist.isPublic,
        createdAt: playlist.createdAt,
      },
    });
  } catch (err) {
    console.error("createPlaylist error:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server khi tạo playlist", error: err.message });
  }
};

/**
 * @desc Cập nhật playlist
 */
export const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;
    const { title, description, isPublic } = req.body;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tồn tại" });

    if (title !== undefined && title.trim() === "")
      return res.status(400).json({ success: false, message: "Tiêu đề playlist không được để trống" });

    if (title !== undefined) playlist.title = title;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.json({ success: true, message: "Cập nhật playlist thành công", playlist });
  } catch (err) {
    console.error("updatePlaylist error:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

/**
 * @desc Xóa playlist và tất cả bài hát trong playlist
 */
export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tồn tại" });

    await PlaylistSong.deleteMany({ playlist: playlistId });
    await playlist.deleteOne();

    res.json({ success: true, message: "Đã xóa playlist và bài hát liên quan", playlistId });
  } catch (err) {
    console.error("deletePlaylist error:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server khi xóa playlist", error: err.message });
  }
};

/**
 * @desc Lấy danh sách bài hát của playlist (refresh previewUrl nếu cần)
 */
export const getPlaylistSongs = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user?._id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId }).lean();
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tồn tại" });

    let songs = await PlaylistSong.find({ playlist: playlistId }).sort({ addedAt: -1 }).lean();

    const updatedSongs = await Promise.all(
      songs.map(async (s) => {
        let previewUrl = s.previewUrl;
        try {
          const { data } = await axios.get(`https://api.deezer.com/track/${s.song}`);
          previewUrl = data.preview || previewUrl;
          if (previewUrl !== s.previewUrl) await PlaylistSong.updateOne({ _id: s._id }, { previewUrl });
        } catch (err) {
          console.error(`Error fetching previewUrl for song ${s.song}:`, err.message);
        }
        return {
          id: s.song,
          title: s.title,
          artist: { name: s.artistName || "Unknown", avatarUrl: s.artistAvatar || "https://placehold.co/100" },
          album: { title: s.albumTitle || "Unknown Album", coverUrl: s.albumCover || "https://placehold.co/300" },
          audioUrl: previewUrl || "",
          addedAt: s.addedAt || null,
        };
      })
    );

    res.status(200).json({ success: true, count: updatedSongs.length, songs: updatedSongs, playlist });
  } catch (err) {
    console.error("getPlaylistSongs error:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

/**
 * @desc Thêm bài hát vào playlist (lấy previewUrl nếu thiếu)
 */
export const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { song } = req.body;
    const userId = req.user._id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tồn tại" });

    const exists = await PlaylistSong.findOne({ playlist: playlistId, song: song.id });
    if (exists) return res.status(200).json({ success: false, message: "Bài hát đã có trong playlist" });

    let previewUrl = song.audioUrl;
    if (!previewUrl) {
      try {
        const { data } = await axios.get(`https://api.deezer.com/track/${song.id}`);
        previewUrl = data.preview || "";
      } catch (err) {
        console.error(`Error fetching previewUrl for song ${song.id}:`, err.message);
      }
    }

    const ps = await PlaylistSong.create({
      playlist: playlistId,
      song: song.id,
      title: song.title,
      artistName: song.artist?.name || "Unknown",
      artistAvatar: song.artist?.avatarUrl || "",
      albumTitle: song.album?.title || "",
      albumCover: song.album?.coverUrl || "",
      previewUrl,
    });

    res.status(201).json({ success: true, message: "Đã thêm bài hát vào playlist", playlistSong: ps });
  } catch (err) {
    console.error("addSongToPlaylist error:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

/**
 * @desc Xóa bài hát khỏi playlist
 */
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tồn tại" });

    const ps = await PlaylistSong.findOneAndDelete({ playlist: playlistId, song: songId });
    if (!ps) return res.status(404).json({ success: false, message: "Bài hát không tồn tại trong playlist" });

    res.json({ success: true, message: "Đã xóa bài hát khỏi playlist", songId });
  } catch (err) {
    console.error("removeSongFromPlaylist error:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};
