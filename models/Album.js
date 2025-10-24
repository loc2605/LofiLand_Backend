import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    releaseDate: { type: Date },
    coverUrl: { type: String },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
  },
  { timestamps: true }
);

const Album = mongoose.model("Album", albumSchema);
export default Album;
