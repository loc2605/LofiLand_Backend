import express from "express";
import {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
} from "../controllers/favoriteController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", authMiddleware, addToFavorites);
router.get("/", authMiddleware, getFavorites);
router.delete("/:songId", authMiddleware, removeFromFavorites);

export default router;
