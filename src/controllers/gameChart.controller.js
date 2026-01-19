const ScrapeResult = require("../models/scrapeResult.model");
const DateNumber = require("../models/dateNumber.model");

// 🔥 Simple In-Memory Cache to prevent DB crashing on high traffic
let cacheData = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 Minutes

exports.getGameChart = async (req, res) => {
  try {
    // 1. Check Cache
    if (cacheData && (Date.now() - lastCacheTime < CACHE_TTL)) {
      return res.json({ success: true, data: cacheData });
    }

    // 2. Fetch Data (Optimized with Sort at DB level)
    // We fetch isoDate to avoid parsing strings in the loop
    const [scrapeData, noidaData] = await Promise.all([
      ScrapeResult.find({}, "gameId date resultNumber isoDate createdAt")
        .sort({ isoDate: 1 }) // DB sort is faster than JS sort
        .lean(),
      DateNumber.find({}, "date number isoDate createdAt")
        .sort({ isoDate: 1 })
        .lean(),
    ]);

    const map = new Map();

    const GAME_MAP = {
      "116": "DESAWAR",
      "127": "SHRI GANESH",
      "126": "DELHI BAZAR",
      "120": "GALI",
      "119": "GHAZIABAD",
      "117": "FARIDABAD",
    };

    const createRow = (date, isoDate) => ({
      date,
      timestamp: isoDate ? isoDate.getTime() : 0, // Store for sorting
      games: {}
    });

    // 3. Process Scrape Data
    for (const { gameId, date, resultNumber, createdAt, isoDate } of scrapeData) {
      const gameName = GAME_MAP[gameId];
      if (!gameName || !date) continue;

      if (!map.has(date)) {
        map.set(date, createRow(date, isoDate));
      }

      map.get(date).games[gameName] = {
        result: String(resultNumber ?? ""),
        createdAt,
        timestamp: new Date(createdAt).getTime()
      };
    }

    // 4. Process Noida Data
    for (const { date, number, createdAt, isoDate } of noidaData) {
      if (!date) continue;

      if (!map.has(date)) {
        map.set(date, createRow(date, isoDate));
      }

      map.get(date).games["NOIDA KING"] = {
        result: String(number ?? ""),
        createdAt,
        timestamp: new Date(createdAt).getTime()
      };
    }

    // 5. Final Sort (Much faster using pre-calculated timestamp)
    const rows = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);

    // Remove temp timestamp field to match exact previous response structure
    const cleanedRows = rows.map(({ timestamp, ...rest }) => rest);

    // 6. Set Cache
    cacheData = cleanedRows;
    lastCacheTime = Date.now();

    res.json({ success: true, data: cleanedRows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Game chart fetch failed",
      error: err.message,
    });
  }
};