import express from "express";
import {
  createPlaylist,
  getPlaylists,
  addSongToPlaylist,
} from "../controllers/playlistsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createPlaylist);
router.get("/", authMiddleware, getPlaylists);
router.post("/:playlistId/songs", authMiddleware, addSongToPlaylist);

export default router;
