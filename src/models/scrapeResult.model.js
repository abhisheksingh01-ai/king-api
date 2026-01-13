const mongoose = require("mongoose");

const scrapeResultSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String, // DD-MM-YYYY
      required: true,
      index: true,
    },
    resultNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// 🔥 prevent duplicate same game + same date
scrapeResultSchema.index({ gameId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("ScrapeResult", scrapeResultSchema);
