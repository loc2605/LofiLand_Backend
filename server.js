import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import cors from "cors";

dotenv.config(); // đọc .env

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect DB
connectDB();

const Test = mongoose.model("Test", new mongoose.Schema({ name: String }));
await Test.create({ name: "Hello LofiLand" });

// route test
app.get("/", (req, res) => {
  res.send("LofiLand API is running...");
});

// routes chính
app.use("/api/users", userRoutes);

// middleware xử lý lỗi
app.use(notFound);
app.use(errorHandler);

// chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
