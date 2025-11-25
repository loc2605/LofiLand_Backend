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
router.post("/", authMiddleware, createPlaylist);       
router.get("/", authMiddleware, getUserPlaylists);
router.put("/:playlistId", authMiddleware, updatePlaylist);  
router.delete("/:playlistId", authMiddleware, deletePlaylist); 

// --- Playlist Songs ---
router.post("/:playlistId/songs", authMiddleware, addSongToPlaylist);  
router.get("/:playlistId/songs", authMiddleware, getPlaylistSongs);   
router.delete("/:playlistId/songs/:songId", authMiddleware, removeSongFromPlaylist);

export default router;
