import express from "express";
import { getArtists, getArtistById } from "../controllers/artistController.js";

const router = express.Router();

router.get("/", getArtists);        // GET /api/artists
router.get("/:id", getArtistById);  // GET /api/artists/:id

export default router;