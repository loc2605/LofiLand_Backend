import mongoose from "mongoose";

const playlistSongSchema = new mongoose.Schema(
  {
    playlist: { type: mongoose.Schema.Types.ObjectId, ref: "Playlist", required: true },
    song: { type: String, required: true },

    title: { type: String },
    artistName: { type: String },
    artistAvatar: { type: String },
    albumTitle: { type: String },
    albumCover: { type: String },
    previewUrl: { type: String },

    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PlaylistSong = mongoose.model("PlaylistSong", playlistSongSchema);
export default PlaylistSong;
