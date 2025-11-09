import History from "../models/History.js";

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


export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await History.find({ user: userId })
      .sort({ playedAt: -1 })
      .limit(50);

    res.json({ success: true, history });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Cannot get song history" });
  }
};
