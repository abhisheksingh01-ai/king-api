const ScrapeResult = require("../models/scrapeResult.model");
const DateNumber = require("../models/dateNumber.model");

exports.getGameChart = async (req, res) => {
  try {
    const [scrapeData, noidaData] = await Promise.all([
      ScrapeResult.find(
        {},
        "gameId date resultNumber createdAt"
      ).lean(),
      DateNumber.find(
        {},
        "date number createdAt"
      ).lean(),
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

    // create base row
    const createRow = (date) => ({
      date,
      games: {}
    });

    // scrape results (multiple games, different times)
    for (const { gameId, date, resultNumber, createdAt } of scrapeData) {
      const gameName = GAME_MAP[gameId];
      if (!gameName || !date) continue;

      if (!map.has(date)) {
        map.set(date, createRow(date));
      }

      map.get(date).games[gameName] = {
        result: String(resultNumber ?? ""),
        createdAt,
        timestamp: new Date(createdAt).getTime()
      };
    }

    // noida king data
    for (const { date, number, createdAt } of noidaData) {
      if (!date) continue;

      if (!map.has(date)) {
        map.set(date, createRow(date));
      }

      map.get(date).games["NOIDA KING"] = {
        result: String(number ?? ""),
        createdAt,
        timestamp: new Date(createdAt).getTime()
      };
    }

    // sort dates by earliest game time
    const rows = Array.from(map.values()).sort((a, b) => {
      const aTime = Math.min(
        ...Object.values(a.games).map(g => g.timestamp)
      );
      const bTime = Math.min(
        ...Object.values(b.games).map(g => g.timestamp)
      );
      return aTime - bTime;
    });

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Game chart fetch failed",
      error: err.message,
    });
  }
};
