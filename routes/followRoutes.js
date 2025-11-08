import express from "express";
import {
  followArtist,
  unfollowArtist,
  getFollowedArtists,
} from "../controllers/followController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/follow", authMiddleware, followArtist);
router.post("/unfollow", authMiddleware, unfollowArtist);
router.get("/user/me", authMiddleware, getFollowedArtists);

export default router;
