const ScrapeResult = require("../models/scrapeResult.model");
const DateNumber = require("../models/dateNumber.model");

exports.getGameChart = async (req, res) => {
  try {
    const [scrapeData, noidaData] = await Promise.all([
      ScrapeResult.find({}, "gameId date resultNumber").lean(),
      DateNumber.find({}, "date number").lean(),
    ]);

    const map = new Map();

    const parseTS = (d) =>
      new Date(d.split("-").reverse().join("-")).getTime();

    const createRow = (date) => ({
      date,
      timestamp: parseTS(date),
      DESAWAR: "",
      "SHRI GANESH": "",
      "DELHI BAZAR": "",
      GALI: "",
      GHAZIABAD: "",
      FARIDABAD: "",
      "NOIDA KING": "",
    });

    const GAME_MAP = {
      "116": "DESAWAR",
      "127": "SHRI GANESH",
      "126": "DELHI BAZAR",
      "120": "GALI",
      "119": "GHAZIABAD",
      "117": "FARIDABAD",
    };

    for (const { gameId, date, resultNumber } of scrapeData) {
      const col = GAME_MAP[gameId];
      if (!col || !date) continue;

      if (!map.has(date)) map.set(date, createRow(date));
      map.get(date)[col] = String(resultNumber ?? "");
    }

    for (const { date, number } of noidaData) {
      if (!date) continue;

      if (!map.has(date)) map.set(date, createRow(date));
      map.get(date)["NOIDA KING"] = String(number ?? "");
    }

    const rows = Array.from(map.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Game chart fetch failed",
      error: err.message,
    });
  }
};
