import express from "express";
import {
  getTracks,
  getTrackById,
  getArtists,
  getAlbums,
  getRandomTracks,
} from "../controllers/deezerController.js";

const router = express.Router();

router.get("/tracks", getTracks);
router.get("/tracks/:id", getTrackById);
router.get("/artists", getArtists);
router.get("/albums", getAlbums);
router.get("/random", getRandomTracks);

export default router;
