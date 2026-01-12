const axios = require('axios');

const scrapeJKSattaAllMonths = async (req, res) => {
    try {
        // 1. Fetch HTML from site
        const { data: html } = await axios.get("https://jksatta.com/", {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // 2. Extract the record object using Regex
        // This looks for "var record = {" and captures everything until "};"
        const recordMatch = html.match(/var\s+record\s*=\s*(\{.*?\});/s);

        if (!recordMatch) {
            return res.status(404).json({
                success: false,
                message: "Could not locate the 'record' variable in the page source."
            });
        }

        // 3. Parse the data
        const record = JSON.parse(recordMatch[1]);
        const results = [];
        const startYear = 2026; // Set your target year here

        // 4. Iterate through the nested structure
        // Level 1: Game IDs (e.g., "29", "23", "35")
        for (const gameId in record) {
            const gameData = record[gameId];

            // Level 2: Date Keys (e.g., "01-01-2019")
            for (const dateKey in gameData) {
                const entry = gameData[dateKey];
                
                // Extract year from the date string "DD-MM-YYYY"
                const year = parseInt(dateKey.split('-')[2]);

                // 5. Filter and Format
                if (year >= startYear) {
                    results.push({
                        gameId: gameId,       // The LD Number/ID
                        date: entry.date,     // Full Date
                        resultNumber: entry.no // Winning Number
                    });
                }
            }
        }

        // Sort by date (optional)
        results.sort((a, b) => new Date(b.date.split('-').reverse().join('-')) - new Date(a.date.split('-').reverse().join('-')));

        res.status(200).json({
            success: true,
            totalFound: results.length,
            data: results
        });

    } catch (err) {
        console.error("Scraper Error:", err.message);
        res.status(500).json({
            success: false,
            message: "Failed to process data",
            error: err.message
        });
    }
};

module.exports = { scrapeJKSattaAllMonths };