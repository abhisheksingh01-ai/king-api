const ScrapeResult = require("../models/scrapeResult.model");
const DateNumber = require("../models/dateNumber.model");

exports.getGameChart = async (req, res) => {
  try {
    // 🔥 FIX 1: Cache Control Headers (Browser ko data save karne se rokein)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Expires', '-1');
    res.set('Pragma', 'no-cache');

    // 🔥 FIX 2: In-Memory Cache Logic Removed (Direct DB call every time)
    
    // 1. Fetch Data (Optimized with Sort at DB level)
    const [scrapeData, noidaData] = await Promise.all([
      ScrapeResult.find({}, "gameId date resultNumber isoDate createdAt")
        .sort({ isoDate: 1 }) 
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
      timestamp: isoDate ? isoDate.getTime() : 0, 
      games: {}
    });

    // 2. Process Scrape Data
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

    // 3. Process Noida Data
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

    // 4. Final Sort
    const rows = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);

    const cleanedRows = rows.map(({ timestamp, ...rest }) => rest);

    res.json({ success: true, data: cleanedRows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Game chart fetch failed",
      error: err.message,
    });
  }
};