const axios = require("axios");
const ScrapeResult = require("../models/scrapeResult.model");

const scrapeJKSattaAllMonths = async (req, res) => {
  try {
    const { data: html } = await axios.get("https://jksatta.com/", {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000,
    });

    const recordMatch = html.match(/var\s+record\s*=\s*(\{.*?\});/s);

    if (!recordMatch) {
      return res.status(404).json({
        success: false,
        message: "Record object not found",
      });
    }

    const record = JSON.parse(recordMatch[1]);
    const startYear = 2026;

    const bulkOps = [];
    const responseData = [];

    for (const gameId in record) {
      for (const dateKey in record[gameId]) {
        const entry = record[gameId][dateKey];
        const year = Number(dateKey.split("-")[2]);

        if (year >= startYear) {
          const payload = {
            gameId,
            date: entry.date,
            resultNumber: entry.no,
          };

          responseData.push(payload);

          // 🔥 BULK UPSERT (FAST)
          bulkOps.push({
            updateOne: {
              filter: { gameId, date: entry.date },
              update: { $set: payload },
              upsert: true,
            },
          });
        }
      }
    }

    // 🚀 single DB hit
    if (bulkOps.length) {
      await ScrapeResult.bulkWrite(bulkOps, { ordered: false });
    }

    // Sort response
    responseData.sort(
      (a, b) =>
        new Date(b.date.split("-").reverse().join("-")) -
        new Date(a.date.split("-").reverse().join("-"))
    );

    res.json({
      success: true,
      totalFound: responseData.length,
      data: responseData,
    });
  } catch (error) {
    console.error("Scrape Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Scraping failed",
      error: error.message,
    });
  }
};

module.exports = { scrapeJKSattaAllMonths };
