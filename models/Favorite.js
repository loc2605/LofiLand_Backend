import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    song: { type: String, required: true },
    title: String,
    artistName: String,
    artistAvatar: String,
    albumTitle: String,
    albumCover: String,
    previewUrl: String,
  },
  { timestamps: true }
);


const Favorite = mongoose.model("Favorite", favoriteSchema);
export default Favorite;
