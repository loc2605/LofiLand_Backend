import Follow from "../models/Follow.js";

// Thêm follow
export const followArtist = async (req, res) => {
  try {
    const userId = req.user._id; // lấy từ middleware
    const { artist } = req.body;

    if (!artist?.id) {
      return res.status(400).json({ message: "Thiếu thông tin nghệ sĩ" });
    }

    // Kiểm tra đã follow chưa
    const existed = await Follow.findOne({ user: userId, "artist.id": artist.id });
    if (existed) {
      return res.status(400).json({ message: "Bạn đã theo dõi nghệ sĩ này rồi" });
    }

    const newFollow = new Follow({ user: userId, artist });
    await newFollow.save();

    res.status(201).json({ success: true, message: "Theo dõi thành công", data: newFollow });
  } catch (error) {
    console.error("Follow artist error:", error);
    res.status(500).json({ message: "Lỗi khi theo dõi nghệ sĩ", error: error.message });
  }
};

// Bỏ theo dõi
export const unfollowArtist = async (req, res) => {
  try {
    const userId = req.user._id; // lấy từ middleware
    const { artistId } = req.body;

    if (!artistId) {
      return res.status(400).json({ message: "Thiếu artistId" });
    }

    const deleted = await Follow.findOneAndDelete({ user: userId, "artist.id": artistId });
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ để hủy theo dõi" });
    }

    res.json({ success: true, message: "Đã bỏ theo dõi nghệ sĩ" });
  } catch (error) {
    console.error("Unfollow artist error:", error);
    res.status(500).json({ message: "Lỗi khi bỏ theo dõi nghệ sĩ", error: error.message });
  }
};

// Lấy danh sách nghệ sĩ đã theo dõi
export const getFollowedArtists = async (req, res) => {
  try {
    const userId = req.user._id; // lấy từ middleware
    const follows = await Follow.find({ user: userId }).sort({ followedAt: -1 });
    res.json({ success: true, data: follows });
  } catch (error) {
    console.error("Get followed artists error:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách theo dõi", error: error.message });
  }
};
