import axios from "axios";

// Lấy danh sách bài hát
export const getTracks = async (req, res) => {
  try {
    const query = req.query.query;

    let response;
    if (query) {
      // Nếu có query thì search
      response = await axios.get(
        `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=20`
      );
    } else {
      // Nếu không có query thì lấy chart toàn cầu
      response = await axios.get(`https://api.deezer.com/chart/0/tracks?limit=20`);
    }

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
};

// Lấy thông tin chi tiết 1 bài hát
export const getTrackById = async (req, res) => {
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
};

// Lấy danh sách nghệ sĩ (ưu tiên chart)
export const getArtists = async (req, res) => {
  try {
    const query = req.query.query;
    let response;

    if (query) {
      // Tìm kiếm theo keyword
      response = await axios.get(
        `https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=20`
      );
      response = response.data;
    } else {
      // Lấy top chart artists
      const chartRes = await axios.get(`https://api.deezer.com/chart`);
      response = chartRes.data.artists || [];
    }

    const artists = response.data.map((artist) => ({
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
};

export const getAlbums = async (req, res) => {
  try {
    const query = req.query.query || "";
    let albumsData = [];

    if (query) {
      // Nếu có query thì search album trực tiếp
      const searchRes = await axios.get(
        `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=50`
      );
      albumsData = searchRes.data.data || [];
    } else {
      // Lấy 50 track chart
      const trackRes = await axios.get(
        `https://api.deezer.com/search?q=all&limit=20`
      );
      const tracksData = trackRes.data.data || [];

      const albumMap = new Map();
      tracksData.forEach(track => {
        if (track.album && !albumMap.has(track.album.id)) {
          albumMap.set(track.album.id, {
            ...track.album,
            artist: track.artist, 
          });
        }
      });

      albumsData = Array.from(albumMap.values());
    }

    const albums = albumsData.map(album => ({
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
};


// Lấy bài hát ngẫu nhiên
export const getRandomTracks = async (req, res) => {
  try {
    const genre = req.query.genre || "lofi";
    const count = parseInt(req.query.count) || 1;
    const excludeIds = (req.query.excludeIds)?.split(",") || [];

    const response = await axios.get(
      `https://api.deezer.com/search?q=${encodeURIComponent(genre)}&limit=50`
    );

    let data = response.data.data.filter(
      (track) => !excludeIds.includes(String(track.id))
    );

    if (!data.length) return res.status(404).json({ message: "Không tìm thấy bài hát phù hợp" });

    const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const pickTracks = count === 1
      ? [randomPick(data)]
      : Array.from({ length: Math.min(count, data.length) }, () => {
          const t = randomPick(data);
          data = data.filter((i) => i.id !== t.id);
          return t;
        });

    const formatted = pickTracks.map((track) => ({
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

    res.json({ success: true, tracks: formatted });
  } catch (error) {
    console.error("Deezer random error:", error.response?.data || error.message);
    res.status(500).json({ message: "Lỗi lấy bài hát ngẫu nhiên từ Deezer" });
  }
};

// Lấy danh sách bài hát của 1 album
export const getTracksByAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;

    if (!albumId) {
      return res.status(400).json({ message: "Thiếu albumId" });
    }

    const { data } = await axios.get(`https://api.deezer.com/album/${albumId}`);

    if (data.error) {
      return res.status(404).json({ message: data.error.message || "Không tìm thấy album." });
    }

    if (!data.tracks || !data.tracks.data) {
      return res.status(404).json({ message: "Album không có bài hát." });
    }

    const tracks = data.tracks.data.map((track) => ({
      id: track.id || '',
      title: track.title || 'Unknown Title',
      artist: {
        id: track.artist?.id || '',
        name: track.artist?.name || 'Unknown Artist',
        avatarUrl: track.artist?.picture_medium || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      },
      album: {
        id: data.id || '',
        title: data.title || 'Unknown Album',
        coverUrl: data.cover_medium || 'https://placehold.co/300x300',
      },
      audioUrl: track.preview || '',
      fullUrl: track.link || '',
    }));

    res.json({ success: true, tracks });
  } catch (error) {
    console.error("Deezer album tracks error:", error.response?.data || error.message);
    res.status(500).json({ message: "Lỗi lấy danh sách bài hát của album từ Deezer" });
  }
};

// Lấy thông tin chi tiết nghệ sĩ, bao gồm album và bài hát nổi bật
export const getArtistDetail = async (req, res) => {
  try {
    const { artistId } = req.params;
    if (!artistId) return res.status(400).json({ message: "Thiếu artistId" });

    const [artistRes, albumsRes, tracksRes] = await Promise.all([
      axios.get(`https://api.deezer.com/artist/${artistId}`),
      axios.get(`https://api.deezer.com/artist/${artistId}/albums`),
      axios.get(`https://api.deezer.com/artist/${artistId}/top?limit=50`),
    ]);

    const artistData = artistRes.data || {};
    const albumsData = albumsRes.data.data || [];
    const tracksData = tracksRes.data.data || [];

    const albums = albumsData.map(album => ({
      id: album.id?.toString() || '',
      title: album.title || 'Unknown Album',
      coverUrl: album.cover_medium || 'https://placehold.co/300x300',
      link: album.link || '',
    }));

    const tracks = tracksData.map(track => ({
      id: track.id?.toString() || '',
      title: track.title || 'Unknown Title',
      artist: {
        id: track.artist?.id?.toString() || '',
        name: track.artist?.name || 'Unknown Artist',
        avatarUrl: track.artist?.picture_medium || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      },
      album: {
        id: track.album?.id?.toString() || '',
        title: track.album?.title || 'Unknown Album',
        coverUrl: track.album?.cover_medium || 'https://placehold.co/300x300',
      },
      audioUrl: track.preview || '',
      duration: track.duration || 180,
    }));

    res.json({
      success: true,
      artist: {
        id: artistId,
        name: artistData.name || 'Unknown Artist',
        avatarUrl: artistData.picture_medium || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      },
      albums,
      tracks,
    });

  } catch (error) {
    console.error("Deezer artist detail error:", error.response?.data || error.message);
    res.status(500).json({ message: "Lỗi lấy thông tin nghệ sĩ từ Deezer" });
  }
};


// Tìm kiếm tất cả: bài hát, album, nghệ sĩ
export const searchAll = async (req, res) => {
  try {
    const query = req.query.query || "";
    if (!query) {
      return res.status(400).json({ message: "Thiếu query" });
    }

    // 1. Search tracks
    const trackRes = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=20`);
    const tracks = trackRes.data.data.map(track => ({
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

    // 2. Search albums
    const albumRes = await axios.get(`https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=20`);
    const albums = albumRes.data.data.map(album => ({
      id: album.id,
      title: album.title,
      artist: {
        id: album.artist?.id,
        name: album.artist?.name,
      },
      coverUrl: album.cover_medium || "",
      link: album.link,
    }));

    // 3. Search artists
    const artistRes = await axios.get(`https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=20`);
    const artists = artistRes.data.data.map(artist => ({
      id: artist.id,
      name: artist.name,
      avatarUrl: artist.picture_medium || "",
      link: artist.link,
      nbFan: artist.nb_fan,
    }));

    res.json({ success: true, tracks, albums, artists });
  } catch (error) {
    console.error("Search Deezer error:", error.response?.data || error.message);
    res.status(500).json({ message: "Lỗi tìm kiếm Deezer" });
  }
};