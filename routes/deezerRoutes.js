import express from "express";
import axios from "axios";

const router = express.Router();

// Route 1: Lấy danh sách bài hát
router.get("/tracks", async (req, res) => {
  try {
    const query = req.query.query;
    const response = await axios.get(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=20`
    );

    const tracks = response.data.data.map((track) => ({
      id: track.id,
      title: track.title,
      artist: {
        id: track.artist?.id,
        name: track.artist?.name,
        avatarUrl: track.artist?.picture_medium || "",
      },
      album: {
        id: track.album?.id,
        title: track.album?.title,
        coverUrl: track.album?.cover_medium || "",
      },
      audioUrl: track.preview,
      fullUrl: track.link,
    }));

    res.json({ success: true, tracks });
  } catch (error) {
    console.error("Deezer tracks error:", error.response?.data || error.message);
    res.status(500).json({ message: "Lỗi lấy dữ liệu bài hát từ Deezer" });
  }
});

// Route 2: Lấy thông tin chi tiết 1 bài hát
router.get("/tracks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await axios.get(`https://api.deezer.com/track/${id}`);

    res.json({
      success: true,
      id: data.id,
      title: data.title,
      artist: {
        id: data.artist.id,
        name: data.artist.name,
        avatarUrl: data.artist.picture_medium || "",
      },
      album: {
        id: data.album.id,
        title: data.album.title,
        coverUrl: data.album.cover_medium,
      },
      audioUrl: data.preview,
      fullUrl: data.link,
    });
  } catch (err) {
    console.error("Deezer track error:", err.message);
    res.status(500).json({ message: "Lỗi khi lấy track từ Deezer" });
  }
});

// Route 3: Lấy danh sách nghệ sĩ
router.get("/artists", async (req, res) => {
  try {
    const query = req.query.query;
    const response = await axios.get(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=20`
    );

    const artists = response.data.data.map((artist) => ({
      id: artist.id,
      name: artist.name,
      avatarUrl: artist.picture_medium || "",
      link: artist.link,
      nbFan: artist.nb_fan,
    }));

    res.json({ success: true, artists });
  } catch (error) {
    console.error("Deezer artists error:", error.response?.data || error.message);
    res.status(500).json({ message: "Lỗi lấy danh sách nghệ sĩ từ Deezer" });
  }
});

// Route 4: Lấy danh sách album
router.get("/albums", async (req, res) => {
  try {
    const query = req.query.query;
    const response = await axios.get(
      `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=20`
    );

    const albums = response.data.data.map((album) => ({
      id: album.id,
      title: album.title,
      artist: {
        id: album.artist?.id,
        name: album.artist?.name,
      },
      coverUrl: album.cover_medium || "",
      link: album.link,
    }));

    res.json({ success: true, albums });
  } catch (error) {
    console.error("Deezer albums error:", error.response?.data || error.message);
    res.status(500).json({ message: "Lỗi lấy danh sách album từ Deezer" });
  }
});

// Route 5: Lấy ngẫu nhiên 1 bài hát
router.get("/random", async (req, res) => {
  try {
    const query = req.query.query || "lofi";
    const response = await axios.get(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=50`
    );
    const data = response.data.data;
    if (!data.length) return res.status(404).json({ message: "Không tìm thấy bài hát" });

    const track = data[Math.floor(Math.random() * data.length)];

    res.json({
      success: true,
      id: track.id,
      title: track.title,
      artist: {
        id: track.artist?.id,
        name: track.artist?.name,
        avatarUrl: track.artist?.picture_medium || "",
      },
      album: {
        id: track.album?.id,
        title: track.album?.title,
        coverUrl: track.album?.cover_medium,
      },
      audioUrl: track.preview,
      fullUrl: track.link,
    });
  } catch (error) {
    console.error("Deezer random error:", error.response?.data || error.message);
    res.status(500).json({ message: "Lỗi lấy bài hát ngẫu nhiên từ Deezer" });
  }
});

export default router;
