import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
    followedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Follow = mongoose.model("Follow", followSchema);
export default Follow;
