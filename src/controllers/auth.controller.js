const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Optimized: Async Sign to prevent event loop blocking
const createToken = (id) => {
  return new Promise((resolve, reject) => {
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Lean returns POJO, faster than Mongoose Document
    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(400).json({ message: "User exists" });

    // Parallelize if you had more tasks, but here strictly sequential is fine
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    const token = await createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production", // 🔥 Security fix
      maxAge: 86400000
    });

    res.status(201).json({ message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Select only what we need. +password is required for check.
    const user = await User.findOne({ email }).select("+password name email role").lean();
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = await createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000
    });

    // Don't send password hash back, even if lean() was used
    delete user.password;

    res.json({ 
      message: "Login successful", 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};