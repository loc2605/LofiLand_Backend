import History from "../models/History.js";
import axios from "axios";

/**
 * @desc Thêm bài hát vào lịch sử phát
 */
export const addHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { song } = req.body;

    if (!song || !song.id) {
      return res.status(400).json({ message: "Song data is required" });
    }

    const existingHistory = await History.findOne({
      user: userId,
      "song.id": song.id,
    });

    if (existingHistory) {
      existingHistory.playedAt = new Date();
      await existingHistory.save();
      return res.json({
        success: true,
        message: "Updated playedAt for existing history item",
        history: existingHistory,
      });
    }

    // Tạo mới
    const history = await History.create({
      user: userId,
      song,
    });

    // Giới hạn 50 bản ghi gần nhất
    const count = await History.countDocuments({ user: userId });
    if (count > 50) {
      // Xóa bài cũ nhất
      const oldest = await History.find({ user: userId })
        .sort({ playedAt: 1 })
        .limit(count - 50);
      const idsToRemove = oldest.map(h => h._id);
      await History.deleteMany({ _id: { $in: idsToRemove } });
    }

    res.json({ success: true, history });
  } catch (error) {
    console.error("Add history error:", error);
    res.status(500).json({ message: "Cannot add song history" });
  }
};

/**
 * @desc Lấy lịch sử phát, đồng thời cập nhật link nhạc từ Deezer
 */
export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    let history = await History.find({ user: userId })
      .sort({ playedAt: -1 })
      .limit(50);

    // Refresh audioUrl từ Deezer nếu cần
    const updatedHistory = await Promise.all(
      history.map(async (h) => {
        let audioUrl = h.song.audioUrl;

        try {
          const { data } = await axios.get(`https://api.deezer.com/track/${h.song.id}`);
          if (data.preview && data.preview !== h.song.audioUrl) {
            audioUrl = data.preview;

            // Cập nhật vào DB
            await History.updateOne(
              { _id: h._id },
              { "song.audioUrl": audioUrl }
            );
          }
        } catch (err) {
          console.error(`Error fetching previewUrl for song ${h.song.id}:`, err.message);
        }

        return {
          ...h.toObject(),
          song: {
            ...h.song,
            audioUrl,
          },
        };
      })
    );

    res.json({ success: true, history: updatedHistory });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Cannot get song history" });
  }
};
