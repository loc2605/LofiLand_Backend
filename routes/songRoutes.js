import express from "express";
import { getSongs, getSongById } from "../controllers/songController.js";

const router = express.Router();

router.get("/", getSongs);
router.get("/:id", getSongById);

export default router;
