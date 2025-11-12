import express from "express";
import {
  addToFavorites,
  removeFromFavorites,
  getFavoriteSongs,
} from "../controllers/favoriteController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addToFavorites);
router.get("/", authMiddleware, getFavoriteSongs);
router.delete("/:songId", authMiddleware, removeFromFavorites);

export default router;
