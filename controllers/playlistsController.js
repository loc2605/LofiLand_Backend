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

    // Lấy 1 bài hát đầu tiên của mỗi playlist để làm cover
    const firstSongs = await PlaylistSong.aggregate([
      { $match: { playlist: { $in: playlistIds } } },
      { $sort: { addedAt: 1 } }, // bài hát cũ nhất
      {
        $group: {
          _id: "$playlist",
          firstSong: { $first: "$$ROOT" }
        }
      }
    ]);
    const coverMap = {};
    firstSongs.forEach(fs => {
      coverMap[fs._id] = fs.firstSong.albumCover || null;
    });

    const DEFAULT_COVER = "https://picsum.photos/seed/defaultPlaylist/300";

    res.json({
      success: true,
      playlists: playlists.map(p => ({
        id: p._id,
        name: p.title,
        description: p.description || "",
        cover: coverMap[p._id] || DEFAULT_COVER,
        count: countMap[p._id] || 0,
      })),
    });
  } catch (err) {
    console.error("getUserPlaylists error:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};



/**
 * @desc Thêm bài hát vào playlist (lưu luôn chi tiết bài hát)
 */
export const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { song } = req.body; // song object từ frontend
    const userId = req.user._id;

    if (!song || !song.id) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bài hát" });
    }

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tồn tại" });

    const exists = await PlaylistSong.findOne({ playlist: playlistId, song: song.id });
    if (exists) return res.status(400).json({ success: false, message: "Bài hát đã có trong playlist" });

    const ps = await PlaylistSong.create({
      playlist: playlistId,
      song: song.id,
      title: song.title,
      artistName: song.artist?.name || "Unknown",
      artistAvatar: song.artist?.avatarUrl || "",
      albumTitle: song.album?.title || "",
      albumCover: song.album?.coverUrl || "",
      previewUrl: song.audioUrl || "",
    });

    res.status(201).json({
      success: true,
      message: "Đã thêm bài hát vào playlist",
      playlistSong: {
        id: ps._id,
        playlistId,
        songId: ps.song,
        title: ps.title,
        artistName: ps.artistName,
        artistAvatar: ps.artistAvatar,
        albumTitle: ps.albumTitle,
        albumCover: ps.albumCover,
        previewUrl: ps.previewUrl,
        addedAt: ps.addedAt,
      },
    });
  } catch (err) {
    console.error("addSongToPlaylist error:", err.message);
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

/**
 * @desc Lấy danh sách bài hát của playlist
 */
export const getPlaylistSongs = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      console.error("User ID missing in request (authMiddleware issue?)");
      return res.status(401).json({
        success: false,
        message: "Người dùng chưa đăng nhập hoặc token không hợp lệ",
      });
    }

    console.log("Fetching playlist songs:", { playlistId, userId });

    // Kiểm tra playlist tồn tại và thuộc về user
    const playlist = await Playlist.findOne({ _id: playlistId, user: userId }).lean();
    if (!playlist) {
      console.error("Playlist not found or not owned by user:", playlistId);
      return res.status(404).json({
        success: false,
        message: "Playlist không tồn tại hoặc không thuộc quyền sở hữu của bạn",
      });
    }

    // Lấy danh sách bài hát
    let songs = [];
    try {
      songs = await PlaylistSong.find({ playlist: playlistId })
        .sort({ addedAt: -1 })
        .lean();
      console.log(`Found ${songs.length} songs in playlist ${playlistId}`);
    } catch (err) {
      console.error("Error fetching PlaylistSong:", err.message);
    }

    const formattedSongs = songs.map((s) => ({
      id: s.song,
      title: s.title,
      artist: {
        name: s.artistName || "Unknown",
        avatarUrl: s.artistAvatar || "https://placehold.co/100",
      },
      album: {
        title: s.albumTitle || "Unknown Album",
        coverUrl: s.albumCover || "https://placehold.co/300",
      },
      audioUrl: s.previewUrl || "",
      addedAt: s.addedAt || null,
    }));

    res.status(200).json({
      success: true,
      count: formattedSongs.length,
      songs: formattedSongs,
      playlist: {
        id: playlist._id,
        title: playlist.title,
        description: playlist.description || "",
      },
    });
  } catch (err) {
    console.error("getPlaylistSongs error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
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

/**
 * @desc Tạo playlist mới
 */
export const createPlaylist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, isPublic } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề playlist không được để trống",
      });
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
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};

/**
 * @desc Xóa playlist
 */
export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;

    // Kiểm tra playlist có thuộc về user không
    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist không tồn tại hoặc bạn không có quyền xóa",
      });
    }

    // Xóa tất cả bài hát trong playlist để tránh rác
    await PlaylistSong.deleteMany({ playlist: playlistId });

    // Xóa playlist
    await playlist.deleteOne();

    res.json({
      success: true,
      message: "Đã xóa playlist thành công",
      playlistId,
    });
  } catch (err) {
    console.error("deletePlaylist error:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
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

    // Kiểm tra playlist thuộc về user
    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist không tồn tại hoặc bạn không có quyền cập nhật",
      });
    }

    // Validate tiêu đề nếu có gửi lên
    if (title !== undefined && title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề playlist không được để trống",
      });
    }

    // Cập nhật từng field khi được truyền lên
    if (title !== undefined) playlist.title = title;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.json({
      success: true,
      message: "Cập nhật playlist thành công",
      playlist: {
        _id: playlist._id,
        title: playlist.title,
        description: playlist.description,
        isPublic: playlist.isPublic,
        updatedAt: playlist.updatedAt,
      },
    });
  } catch (err) {
    console.error("updatePlaylist error:", err.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};
