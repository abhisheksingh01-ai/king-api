require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const cron = require("node-cron"); // 1. Import Cron

// ---------------------------------------------------------
// 2. IMPORT YOUR SCRAPER FUNCTION
// Check your folder: "controllers" -> "scraperController.js" (or similar)
// You need to import the function that performs the logic.
// ---------------------------------------------------------
// Example: const { saveScrapeData } = require("./controllers/scrapeController");
// If you don't know the import, leave this commented and see "Alternative" below.
const axios = require("axios"); 

// Connect DB first
connectDB();

const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------
// 3. SCHEDULER LOGIC (The Fix)
// ---------------------------------------------------------
const targetTimes = [
  "06:30", "15:20", "17:55", "18:25", "21:50", "23:45"
];

console.log(`🚀 Scheduler Active. Target Times (IST): ${targetTimes.join(", ")}`);

targetTimes.forEach((timeStr) => {
  const [hour, minute] = timeStr.split(":");

  // Cron Syntax: "Minute Hour * * *"
  cron.schedule(`${minute} ${hour} * * *`, async () => {
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    console.log(`⏰ [${now}] Triggering Scheduled Scrape for ${timeStr}...`);

    try {
      // --- OPTION A: Call Function Directly (Best Performance) ---
      // await saveScrapeData(); 

      // --- OPTION B: Call your own API (Easiest Integration) ---
      // This simulates a user visiting the scrape URL
      // Change the URL below to match your actual API route for scraping
      // const scrapeUrl = `https://king-api-emi1.onrender.com/api/v1/scrape`; 
      const scrapeUrl = `http://localhost:5000/api/v1/scrape`
      await axios.get(scrapeUrl);
      
      console.log(`✅ Scrape Success for ${timeStr}`);
    } catch (err) {
      console.error(`❌ Scrape Failed for ${timeStr}:`, err.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Forces Indian Standard Time
  });
});

// ---------------------------------------------------------
// Start Server
// ---------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});