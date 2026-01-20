const axios = require("axios");
const cron = require("node-cron");
const ScrapeResult = require("../models/scrapeResult.model");

// --- 1. CORE SCRAPING LOGIC (Reusable Function) ---
// Is function ko req, res ki zarurat nahi hai, yeh sirf data laata hai aur save karta hai.
const performScrapingTask = async () => {
  console.log(`⏳ Starting Scheduled Scrape at: ${new Date().toLocaleString("en-IN")}`);
  
  try {
    const { data: html } = await axios.get("https://jksatta.com/", {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000,
    });

    const recordMatch = html.match(/var\s+record\s*=\s*(\{.*?\});/s);

    if (!recordMatch) {
      console.error("❌ Scrape Error: Record object not found");
      return { success: false, message: "Record object not found" };
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
          const isoDate = new Date(year, Number(month) - 1, Number(day));

          const payload = {
            gameId,
            date: entry.date,
            isoDate: isoDate,
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

    // Sort results
    responseData.sort((a, b) => b.isoDate - a.isoDate);

    console.log(`✅ Scrape Success: Updated ${responseData.length} records.`);
    return { success: true, totalFound: responseData.length, data: responseData };

  } catch (error) {
    console.error("❌ Scrape Failed:", error.message);
    return { success: false, message: error.message };
  }
};

// --- 2. CRON JOB SCHEDULE (Automatic Trigger) ---
// Times: "05:59", "11:59", "14:44", "14:59", "18:29", "18:49", "22:24"
const scheduleTimes = [
  "59 05 * * *", // 05:59
  "59 11 * * *", // 11:59
  "44 14 * * *", // 14:44
  "59 14 * * *", // 14:59
  "14 18 * * *", // 18:29
  "49 18 * * *", // 18:49
  "24 22 * * *"  // 22:24
];

scheduleTimes.forEach((cronExpression) => {
  cron.schedule(cronExpression, async () => {
    // Yeh automatic chalega server par
    await performScrapingTask();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Important: India time ke hisab se chalega
  });
});

console.log("🚀 Scraper Scheduler Initialized for specific times.");


// --- 3. API CONTROLLER (Manual Trigger from Dashboard) ---
// Yeh function Dashboard ke "Sync" button ke liye hai
const scrapeJKSattaAllMonths = async (req, res) => {
  try {
    // Hum wahi same logic reuse kar rahe hain
    const result = await performScrapingTask();

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unexpected Controller Error",
      error: error.message,
    });
  }
};

module.exports = { scrapeJKSattaAllMonths };