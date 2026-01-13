const ScrapeResult = require("../models/scrapeResult.model");

exports.getScrapeResults = async (req, res) => {
  try {
    const { gameId, date, limit = 100 } = req.query;

    const filter = {};
    if (gameId) filter.gameId = gameId;
    if (date) filter.date = date;

    const data = await ScrapeResult.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit))
      .lean(); // 🔥 FAST

    res.json({
      success: true,
      totalFound: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
