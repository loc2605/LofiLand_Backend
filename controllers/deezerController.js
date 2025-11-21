import axios from "axios";

const DZ = axios.create({
  baseURL: "https://api.deezer.com",
  timeout: 5000,
});

/** --- Helper: safe Deezer fetch --- */
async function dzGet(url) {
  try {
    const res = await DZ.get(url);
    if (res.data?.error) return null;
    return res.data;
  } catch (e) {
    console.log("Deezer API error:", e.response?.data || e.message);
    return null;
  }
}

/** --- Formatter helpers --- */
const formatArtist = (a) => ({
  id: a?.id?.toString() || "",
  name: a?.name || "Unknown Artist",
  avatarUrl: a?.picture_medium || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  nbFan: a?.nb_fan || 0,
  link: a?.link || "",
});

const formatAlbum = (a) => ({
  id: a?.id?.toString() || "",
  title: a?.title || "Unknown Album",
  coverUrl: a?.cover_medium || "https://placehold.co/300x300",
  artist: a?.artist ? formatArtist(a.artist) : null,
  link: a?.link || "",
});

const formatTrack = (t) => ({
  id: t?.id?.toString() || "",
  title: t?.title || "Unknown Title",
  audioUrl: t?.preview || "",
  fullUrl: t?.link || "",
  duration: t?.duration || 180,
  artist: t?.artist ? formatArtist(t.artist) : null,
  album: t?.album ? formatAlbum(t.album) : null,
});

/** -------------------
 *  GET TRACKS (search or chart)
 * ------------------*/
export const getTracks = async (req, res) => {
  const query = req.query.query || "";

  const url = query
    ? `/search?q=${encodeURIComponent(query)}&limit=50`
    : `/chart/0/tracks?limit=50`;

  const data = await dzGet(url);
  if (!data || !data.data || data.data.length === 0) {
    return res.status(404).json({ message: "Không tìm thấy bài hát" });
  }

  // Random 20 bài từ 50 bài
  const shuffled = data.data.sort(() => 0.5 - Math.random());
  const tracks = shuffled.slice(0, 20).map(formatTrack);

  res.json({
    success: true,
    tracks,
  });
};

/** -------------------
 *  GET TRACK BY ID
 * ------------------*/
export const getTrackById = async (req, res) => {
  const { id } = req.params;
  const data = await dzGet(`/track/${id}`);

  if (!data) return res.status(404).json({ message: "Không tìm thấy bài hát" });

  res.json({
    success: true,
    ...formatTrack(data),
  });
};

/** -------------------
 *  GET ARTISTS
 * ------------------*/
export const getArtists = async (req, res) => {
  const query = req.query.query;
  const limitRandom = parseInt(req.query.limit) || 20;

  let data;

  if (query) {
    const search = await dzGet(`/search/artist?q=${encodeURIComponent(query)}&limit=60`);
    data = search?.data || [];
  } else {
    const chart = await dzGet(`/chart`);
    data = chart?.artists?.data || [];
  }

  if (!data || data.length === 0) {
    return res.json({ success: true, artists: [] });
  }

  // Random
  const shuffled = data.sort(() => 0.5 - Math.random());
  const artists = shuffled.slice(0, Math.min(limitRandom, shuffled.length)).map(formatArtist);

  res.json({
    success: true,
    artists,
  });
};


/** -------------------
 *  GET ALBUMS (search or from chart)
 * ------------------*/
export const getAlbums = async (req, res) => {
  const keyword = "nhạc";

  // search album của Deezer
  const search = await dzGet(`/search/album?q=${encodeURIComponent(keyword)}&limit=100`);
  const rawAlbums = search?.data || [];

  res.json({
    success: true,
    keywordUsed: keyword,
    total: rawAlbums.length,
    albums: rawAlbums.map(formatAlbum),
  });
};

/** -------------------
 *  GET TRACKS BY ALBUM
 * ------------------*/
export const getTracksByAlbum = async (req, res) => {
  const { albumId } = req.params;

  const album = await dzGet(`/album/${albumId}`);
  if (!album) return res.status(404).json({ message: "Không tìm thấy album" });

  res.json({
    success: true,
    album: formatAlbum(album),
    tracks: (album.tracks?.data || []).map((t) => ({
      ...formatTrack(t),
      album: formatAlbum(album),
    })),
  });
};

/** -------------------
 *  GET ARTIST DETAIL (profile + albums + top tracks)
 * ------------------*/
export const getArtistDetail = async (req, res) => {
  const { artistId } = req.params;

  const [artist, albumsRaw, top] = await Promise.all([
    dzGet(`/artist/${artistId}`),
    dzGet(`/artist/${artistId}/albums?limit=200`),
    dzGet(`/artist/${artistId}/top?limit=50`),
  ]);

  if (!artist) return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

  res.json({
    success: true,
    artist: formatArtist(artist),
    albums: (albumsRaw?.data || []).map(formatAlbum),
    tracks: (top?.data || []).map(formatTrack),
  });
};

/** -------------------
 *  RANDOM TRACK
 * ------------------*/
export const getRandomTracks = async (req, res) => {
  const genre = req.query.genre || "lofi";
  const count = parseInt(req.query.count) || 1;
  const excludeIds = (req.query.excludeIds || "").split(",");

  const search = await dzGet(`/search?q=${encodeURIComponent(genre)}&limit=60`);
  if (!search || !search.data.length)
    return res.status(404).json({ message: "Không tìm thấy bài hát" });

  let filtered = search.data.filter((t) => !excludeIds.includes(String(t.id)));

  const pickOne = () => filtered[Math.floor(Math.random() * filtered.length)];

  const picks = Array.from({ length: Math.min(count, filtered.length) }, pickOne)
    .map(formatTrack);

  res.json({ success: true, tracks: picks });
};

/** -------------------
 *  SEARCH ALL
 * ------------------*/
export const searchAll = async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ message: "Thiếu query" });

  const [tracks, albums, artists] = await Promise.all([
    dzGet(`/search?q=${encodeURIComponent(query)}&limit=20`),
    dzGet(`/search/album?q=${encodeURIComponent(query)}&limit=20`),
    dzGet(`/search/artist?q=${encodeURIComponent(query)}&limit=20`),
  ]);

  res.json({
    success: true,
    tracks: (tracks?.data || []).map(formatTrack),
    albums: (albums?.data || []).map(formatAlbum),
    artists: (artists?.data || []).map(formatArtist),
  });
};

/** -------------------
 *  GET TRENDING (top tracks + top artists)
 * ------------------*/
export const getTrending = async (req, res) => {
  try {
    // Top 10 tracks trending
    const tracksData = await dzGet("/chart/0/tracks?limit=10");
    const tracks = (tracksData?.data || []).map(formatTrack);

    // Top 10 artists trending
    const artistsData = await dzGet("/chart/0/artists?limit=10");
    const artists = (artistsData?.data || []).map(formatArtist);

    res.status(200).json({ success: true, tracks, artists });
  } catch (err) {
    console.error("Trending API error:", err);
    res.status(500).json({ success: false, message: "Không thể lấy dữ liệu trending" });
  }
};
