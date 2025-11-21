import axios from 'axios';
import { GoogleGenAI, ApiError } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateText(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ type: 'text', text: prompt }],
    });

    const candidate = response.candidates?.[0];
    if (!candidate) return null;

    let text = '';
    if (candidate.content?.parts) {
      text = candidate.content.parts.map(p => p.text || '').join(' ').trim();
    }

    return text || null;
  } catch (err) {
    console.error('Lỗi generateText:', err);
    return null;
  }
}

// --- Hàm gợi ý bài hát từ Deezer ---
export async function suggestSongs(query) {
  try {
    const res = await axios.get(`https://api.deezer.com/search`, {
      params: { q: query, limit: 10 }, // tăng limit để playlist dài hơn
    });

    if (!res.data || !res.data.data) return { playlist: [], firstSong: null };

    const playlist = res.data.data.map(song => ({
      id: song.id.toString(),
      title: song.title,
      artist: { name: song.artist.name },
      album: { coverUrl: song.album.cover_medium },
      audioUrl: song.preview,
      duration: song.duration * 1000,
      link: song.link,
    }));

    return {
      playlist,
      firstSong: playlist[0] || null, // để Playingscreen load bài đầu tiên
    };
  } catch (err) {
    console.error('Lỗi Deezer API:', err);
    return { playlist: [], firstSong: null };
  }
}