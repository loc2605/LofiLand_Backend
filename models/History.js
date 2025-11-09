import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    song: {
      id: String,
      title: String,
      audioUrl: String,
      album: {
        id: String,
        title: String,
        coverUrl: String,
      },
      artist: {
        id: String,
        name: String,
        avatarUrl: String,
      },
    },
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const History = mongoose.model("History", historySchema);

export default History; 
