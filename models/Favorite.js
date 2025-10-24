import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
  },
  { timestamps: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);
export default Favorite;
