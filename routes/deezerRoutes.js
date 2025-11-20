import express from "express";
import {
  getTracks,
  getTrackById,
  getArtists,
  getAlbums,
  getRandomTracks,
  getTracksByAlbum,
  getArtistDetail,
  searchAll,
  getTrending,
} from "../controllers/deezerController.js";

const router = express.Router();

router.get("/tracks", getTracks);
router.get("/tracks/:id", getTrackById);
router.get("/artists", getArtists);
router.get("/albums", getAlbums);
router.get("/random", getRandomTracks);
router.get("/album/:albumId/tracks", getTracksByAlbum); 
router.get("/artist/:artistId/detail", getArtistDetail);
router.get("/search", searchAll);
router.get("/trending", getTrending);

export default router;
