import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: { type: String },
    avatarUrl: { type: String },
    country: { type: String },
    debutYear: { type: Number },
  },
  { timestamps: true }
);

const Artist = mongoose.model("Artist", artistSchema);
export default Artist;
