import Follow from "../models/Follow.js";

// Follow hoặc tạo mới nếu chưa tồn tại
export const followArtist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { artist } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!artist || !artist.id || !artist.name) {
      return res.status(400).json({ message: "Thiếu thông tin nghệ sĩ" });
    }

    // Upsert: nếu đã follow thì trả về document hiện có, nếu chưa thì tạo mới
    const newFollow = await Follow.findOneAndUpdate(
      { user: userId, "artist.id": artist.id },
      { user: userId, artist, followedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, message: "Đã theo dõi nghệ sĩ", data: newFollow });
  } catch (error) {
    console.error("Follow artist error:", error);
    res.status(500).json({ message: "Lỗi khi theo dõi nghệ sĩ", error: error.message });
  }
};

// Unfollow
export const unfollowArtist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { artistId } = req.body;

    if (!artistId) {
      return res.status(400).json({ message: "Thiếu artistId" });
    }

    // Xóa nếu tồn tại, nếu không thì vẫn trả về success
    const deleted = await Follow.findOneAndDelete({ user: userId, "artist.id": artistId });

    res.status(200).json({ success: true, message: "Đã bỏ theo dõi nghệ sĩ", data: deleted });
  } catch (error) {
    console.error("Unfollow artist error:", error);
    res.status(500).json({ message: "Lỗi khi bỏ theo dõi nghệ sĩ", error: error.message });
  }
};

// Lấy danh sách nghệ sĩ đã follow
export const getFollowedArtists = async (req, res) => {
  try {
    const userId = req.user._id;
    const follows = await Follow.find({ user: userId }).sort({ followedAt: -1 });
    res.status(200).json({ success: true, data: follows });
  } catch (error) {
    console.error("Get followed artists error:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách theo dõi", error: error.message });
  }
};
