import express from "express";
import { createPlaylist, getPlaylists } from "../controllers/playlistsController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, createPlaylist);
router.get("/", isAuthenticated, getPlaylists);

export default router;