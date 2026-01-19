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
        const [day, month, yearStr] = entry.date.split("-");
        const year = Number(yearStr);

        if (year >= startYear) {
          // Prepare ISO date for optimization
          const isoDate = new Date(year, Number(month) - 1, Number(day));

          const payload = {
            gameId,
            date: entry.date,
            isoDate: isoDate, // 🔥 Insert Optimized Date
            resultNumber: entry.no,
          };

          responseData.push(payload);

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

    if (bulkOps.length) {
      await ScrapeResult.bulkWrite(bulkOps, { ordered: false });
    }

    // Fast Sort using ISO date object we just created
    responseData.sort((a, b) => b.isoDate - a.isoDate);

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