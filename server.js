import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import playlistRoutes from "./routes/playlistsRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import deezerRoutes from "./routes/deezerRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect DB
connectDB();

// route test
app.get("/", (req, res) => {
  res.send("LofiLand API is running...");
});

// routes chính
app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/deezer", deezerRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/playlists", playlistRoutes);

// middleware xử lý lỗi
app.use(notFound);
app.use(errorHandler);

// chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(` Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
