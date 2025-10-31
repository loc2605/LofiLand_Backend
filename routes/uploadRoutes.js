import express from "express";
import upload from "../middleware/upload.js";
import { uploadFile } from "../utils/file.service.js";

const router = express.Router();

router.post("/", upload, async (req, res) => {
  try {
    const files = req.files;
    const results = {};

    if (files.coverUrl && files.coverUrl[0]) {
      results.coverUrl = await uploadFile(files.coverUrl[0]);
    }

    if (files.avatarUrl && files.avatarUrl[0]) {
      results.avatarUrl = await uploadFile(files.avatarUrl[0]);
    }

    res.status(200).json({
      message: "Upload successful",
      data: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

export default router;