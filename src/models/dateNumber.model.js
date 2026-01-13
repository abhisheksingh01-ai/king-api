const mongoose = require("mongoose");

const dateNumberSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true, // 🔥 VERY IMPORTANT
      match: /^\d{2}-\d{2}-\d{4}$/ // DD-MM-YYYY validation
    },
    number: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DateNumber", dateNumberSchema);
