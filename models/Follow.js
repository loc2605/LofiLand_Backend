import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    artist: {
      id: { type: String},
      name: { type: String },
      avatarUrl: { type: String },
      link: { type: String },
      nbFan: { type: Number, default: 0 },
    },
    followedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Follow = mongoose.model("Follow", followSchema);
export default Follow;
