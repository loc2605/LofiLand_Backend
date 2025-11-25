import axios from "axios";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/* -------------------------------------------------------
   1) Hàm gọi AI để tạo text
-------------------------------------------------------- */
export async function generateText(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ type: "text", text: prompt }],
    });

    const candidate = response.candidates?.[0];
    if (!candidate) return null;

    let text = "";
    if (candidate.content?.parts) {
      text = candidate.content.parts.map((p) => p.text || "").join(" ");
    }

    return text.trim() || null;
  } catch (err) {
    console.error("Lỗi generateText:", err);
    return null;
  }
}

/* -------------------------------------------------------
   2) AI phân tích mood từ câu người dùng
-------------------------------------------------------- */
export async function analyzeMusicQuery(query) {
  const prompt = `
Người dùng đang yêu cầu gợi ý nhạc. 
Hãy phân tích mood hoặc cảm xúc từ câu sau và trả về keyword nhạc phù hợp (1–3 từ, tiếng Anh):

"${query}"

Ví dụ đầu ra hợp lệ:
- "lofi"
- "chill beats"
- "sad piano"
- "happy edm"
- "focus music"

Chỉ trả về keyword, không giải thích.
`;

  const keyword = await generateText(prompt);
  return keyword?.toLowerCase().trim() || "";
}

/* -------------------------------------------------------
   3) Suggest songs bằng AI → Deezer
-------------------------------------------------------- */
export async function suggestSongs(query) {
  try {
    // 1) AI phân tích mood / keyword
    const aiKeyword = await analyzeMusicQuery(query);
    const finalKeyword = aiKeyword || query;

    console.log("AI keyword:", finalKeyword);

    // 2) Gọi Deezer bằng keyword AI chọn
    const res = await axios.get("https://api.deezer.com/search", {
      params: { q: finalKeyword, limit: 10 },
    });

    if (!res.data || !res.data.data) {
      return { playlist: [], firstSong: null, keyword: finalKeyword };
    }

    const playlist = res.data.data.map((song) => ({
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
      firstSong: playlist[0] || null,
      keyword: finalKeyword,
    };
  } catch (err) {
    console.error("Lỗi suggestSongs:", err);
    return { playlist: [], firstSong: null, keyword: null };
  }
}
