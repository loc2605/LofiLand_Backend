import express from "express";
import { addToFavorites, getFavorites } from "../controllers/favoriteController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, addToFavorites);
router.get("/", isAuthenticated, getFavorites);

export default router;