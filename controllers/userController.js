import User from "../models/User.js";
import { uploadFile } from "../utils/file.service.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// === Đăng ký ===
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
    }

    // Kiểm tra email đã tồn tại chưa
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Kiểm tra username đã tồn tại chưa
    const existUsername = await User.findOne({ username });
    if (existUsername) {
      return res.status(400).json({ message: "Username đã được sử dụng" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // Bắt lỗi duplicate key phòng trường hợp bỏ sót
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        message: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} đã được sử dụng`,
      });
    }

    res.status(500).json({ message: "Lỗi server" });
  }
};

// === Đăng nhập ===
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Thiếu thông tin đăng nhập" });
    }

    // Tìm user theo email hoặc username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
  // === Lấy thông tin user hiện tại ===
  export const getCurrentUser = (req, res) => {
    try {
      // req.user được gắn từ authMiddleware
      const user = req.user;
      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      });
    } catch (err) {
      console.error("Get user error:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  };

  // === Chỉnh sửa hồ sơ ===
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username } = req.body;
    const file = req.file;

    const updateData = {};
    if (username) updateData.username = username;
    if (file) updateData.avatarUrl = await uploadFile(file);

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    res.json({
      message: "Cập nhật hồ sơ thành công",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

