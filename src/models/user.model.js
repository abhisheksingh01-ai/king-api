const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    password: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
