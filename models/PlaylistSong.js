import mongoose from "mongoose";

const playlistSongSchema = new mongoose.Schema(
  {
    playlist: { type: mongoose.Schema.Types.ObjectId, ref: "Playlist" },
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PlaylistSong = mongoose.model("PlaylistSong", playlistSongSchema);
export default PlaylistSong;
