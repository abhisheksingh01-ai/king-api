const express = require("express");
const router = express.Router();

const { scrapeJKSattaAllMonths } = require("../controllers/scrape.controller");
const { getScrapeResults } = require("../controllers/scrapeRead.controller");

const cacheMedium = (req, res, next) => {
  res.set("Cache-Control", "public, max-age=60");
  next();
};

/**
 * @swagger
 * tags:
 *   - name: Scraper
 *     description: JK Satta scraping & result APIs
 */

/**
 * @swagger
 * /api/v1/scrape:
 *   get:
 *     summary: Scrape JK Satta data
 *     tags: [Scraper]
 *     responses:
 *       200:
 *         description: Data scraped successfully
 *       500:
 *         description: Server error
 */
router.get("/scrape", scrapeJKSattaAllMonths);

/**
 * @swagger
 * /api/v1/results:
 *   get:
 *     summary: Get JK Satta results
 *     tags: [Scraper]
 *     parameters:
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Results fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/results", cacheMedium, getScrapeResults);

module.exports = router;
