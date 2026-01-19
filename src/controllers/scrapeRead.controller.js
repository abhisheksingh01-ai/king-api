const ScrapeResult = require("../models/scrapeResult.model");

exports.getScrapeResults = async (req, res) => {
  try {
    const { gameId, date, limit = 100 } = req.query;

    const filter = {};
    if (gameId) filter.gameId = gameId;
    if (date) filter.date = date;

    // 🔥 Cache Control: Tell browser to cache this for 60 seconds
    res.set('Cache-Control', 'public, max-age=60');

    const data = await ScrapeResult.find(filter)
      .sort({ isoDate: -1 }) // 🔥 Much faster sort
      .limit(Number(limit))
      .lean();

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