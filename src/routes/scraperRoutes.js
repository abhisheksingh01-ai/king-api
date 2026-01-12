const express = require("express");
const router = express.Router();
const { scrapeJKSattaAllMonths } = require("../controllers/scraperController");

/**
 * @swagger
 * tags:
 *   name: Scraper
 *   description: Web scraping APIs
 */

/**
 * @swagger
 * /api/v1/scrape:
 *   get:
 *     summary: Scrape full data from JK Satta (2026 onwards)
 *     tags: [Scraper]
 *     responses:
 *       200:
 *         description: Successfully retrieved data
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
 *                         example: "29"
 *                       date:
 *                         type: string
 *                         example: "12-01-2026"
 *                       resultNumber:
 *                         type: string
 *                         example: "23"
 *       500:
 *         description: Server error
 */
router.get("/scrape", scrapeJKSattaAllMonths);

module.exports = router;
