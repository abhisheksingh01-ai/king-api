const mongoose = require("mongoose");

const dateNumberSchema = new mongoose.Schema(
  {
    date: {
      type: String, 
      required: true,
      unique: true,
    },
    number: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DateNumber", dateNumberSchema);
