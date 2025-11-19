import History from "../models/History.js";
import axios from "axios";

/**
 * @desc Thêm bài hát vào lịch sử phát
 */
export const addHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { song } = req.body;

    if (!song?.id) {
      return res.status(400).json({ message: "Song data is required" });
    }

    // Update nếu bài đã tồn tại
    const existing = await History.findOneAndUpdate(
      { user: userId, "song.id": song.id },
      { $set: { playedAt: new Date() } },
      { new: true }
    );

    if (existing) {
      return res.json({
        success: true,
        message: "Updated playedAt",
        history: existing,
      });
    }

    // Create mới
    const history = await History.create({ user: userId, song });

    // Giới hạn 50 bản ghi → chỉ xóa 1 bản cũ nhất nếu thừa
    const count = await History.countDocuments({ user: userId });
    if (count > 50) {
      const oldest = await History.findOne({ user: userId })
        .sort({ playedAt: 1 })
        .select("_id");
      await History.deleteOne({ _id: oldest._id });
    }

    res.json({ success: true, history });
  } catch (error) {
    console.error("Add history error:", error);
    res.status(500).json({ message: "Cannot add song history" });
  }
};

/**
 * @desc Lấy lịch sử phát (tối ưu request Deezer)
 */
export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    let history = await History.find({ user: userId })
      .sort({ playedAt: -1 })
      .limit(50)
      .lean();

    // Danh sách track cần refresh audioUrl
    const needRefresh = history.filter(
      (h) => !h.song?.audioUrl
    );

    // Nếu không cần refresh → trả luôn
    if (needRefresh.length === 0) {
      return res.json({ success: true, history });
    }

    // Giới hạn concurrency (max 5 request cùng lúc)
    const limit = 5;
    const queue = [...needRefresh];
    const results = [];

    const run = async () => {
      while (queue.length) {
        const h = queue.shift();
        try {
          const { data } = await axios.get(
            `https://api.deezer.com/track/${h.song.id}`
          );

          if (data.preview) {
            await History.updateOne(
              { _id: h._id },
              { "song.audioUrl": data.preview }
            );

            h.song.audioUrl = data.preview; // update local copy
          }
        } catch (err) {
          console.error("Deezer error:", err.message);
        }
        results.push(h);
      }
    };

    // Chạy max 5 thread
    await Promise.all(new Array(limit).fill(0).map(run));

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Cannot get song history" });
  }
};
