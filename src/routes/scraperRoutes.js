const express = require("express");
const router = express.Router();

const {
  scrapeJKSattaAllMonths,
} = require("../controllers/scrape.controller");

const {
  getScrapeResults,
} = require("../controllers/scrapeRead.controller");

/**
 * @swagger
 * tags:
 *   name: Scraper
 *   description: JK Satta scraping & result APIs
 */

/**
 * @swagger
 * /api/v1/scrape:
 *   get:
 *     summary: Scrape JK Satta data (2026 onwards) and save to database
 *     tags: [Scraper]
 *     responses:
 *       200:
 *         description: Data scraped and stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalFound:
 *                   type: integer
 *                   example: 120
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       gameId:
 *                         type: string
 *                         example: "116"
 *                       date:
 *                         type: string
 *                         example: "13-01-2026"
 *                       resultNumber:
 *                         type: string
 *                         example: "51"
 *       500:
 *         description: Server error
 */
router.get("/scrape", scrapeJKSattaAllMonths);

/**
 * @swagger
 * /api/v1/results:
 *   get:
 *     summary: Get JK Satta results from database
 *     tags: [Scraper]
 *     parameters:
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: string
 *         example: "116"
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         example: "13-01-2026"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 20
 *     responses:
 *       200:
 *         description: Results fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/results", getScrapeResults);

module.exports = router;
