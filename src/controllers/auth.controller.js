const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email }).lean();
  if (exists) return res.status(400).json({ message: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });

  const token = createToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400000
  });

  res.status(201).json({ message: "Registered successfully" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = createToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400000
  });

  res.json({ 
    message: "Login successful", 
    user: { 
      name: user.name, 
      email: user.email, 
      role: user.role 
    } 
  })
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};
