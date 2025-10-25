import express from "express";
import { getAlbums, getAlbumById } from "../controllers/albumController.js";

const router = express.Router();

router.get("/", getAlbums);        // GET /api/albums
router.get("/:id", getAlbumById);  // GET /api/albums/:id

export default router;