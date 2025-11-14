import express from "express";
import {
  createPlaylist,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  getPlaylistSongs,
  removeSongFromPlaylist
} from "../controllers/playlistsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Playlist CRUD ---
router.post("/", authMiddleware, createPlaylist);                // Tạo playlist mới
router.get("/", authMiddleware, getUserPlaylists);               // Lấy tất cả playlist của user
router.put("/:playlistId", authMiddleware, updatePlaylist);      // Cập nhật playlist
router.delete("/:playlistId", authMiddleware, deletePlaylist);   // Xóa playlist

// --- Playlist Songs ---
router.post("/:playlistId/songs", authMiddleware, addSongToPlaylist);           // Thêm bài hát vào playlist
router.get("/:playlistId/songs", authMiddleware, getPlaylistSongs);             // Lấy danh sách bài hát trong playlist
router.delete("/:playlistId/songs/:songId", authMiddleware, removeSongFromPlaylist); // Xóa bài hát khỏi playlist

export default router;
