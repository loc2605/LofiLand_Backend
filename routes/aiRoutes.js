import express from 'express';
import { generateText, suggestSongs } from '../services/aiService.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  try {
    // 1. Lấy text từ Gemini AI
    const output = await generateText(prompt);
    const cleanText = output?.trim() || 'Xin lỗi, tôi không hiểu.';

    // 2. Lấy gợi ý bài hát từ Deezer (playlist + bài đầu tiên)
    const { playlist, firstSong } = await suggestSongs(prompt);

    res.json({
      success: true,
      output: cleanText,
      songs: playlist, // trả về cả playlist
      firstSong,       // để có thể mở bài đầu tiên luôn
    });
  } catch (err) {
    console.error('Chat AI error:', err);
    res.status(500).json({ message: 'AI request failed' });
  }
});

export default router;
