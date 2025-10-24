import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist;
