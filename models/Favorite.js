import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    song: { type: String, required: true }, // Thay đổi từ ObjectId sang String
  },
  { timestamps: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);
export default Favorite;
