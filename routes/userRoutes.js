import express from "express";
import multer from "multer";
import { registerUser, loginUser, getCurrentUser, updateProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, upload.single("avatar"), updateProfile);

export default router;