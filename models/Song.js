import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number },
    releaseDate: { type: Date },
    audioUrl: { type: String, required: true },
    coverUrl: { type: String },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
    genre: { type: mongoose.Schema.Types.ObjectId, ref: "Genre" },
  },
  { timestamps: true }
);

const Song = mongoose.model("Song", songSchema);
export default Song;
