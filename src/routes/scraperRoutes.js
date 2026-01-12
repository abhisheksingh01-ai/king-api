const express = require('express');
const router = express.Router();
// Use destructuring to get the exact function name from the controller
const { scrapeJKSattaAllMonths } = require('../controllers/scraperController');

/**
 * @swagger
 * /api/v1/scrape:
 * get:
 * summary: Scrape full data from JK Satta (2026 onwards)
 * tags: [Scraper]
 * responses:
 * 200:
 * description: Successfully retrieved data
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success:
 * type: boolean
 * totalResults:
 * type: integer
 * data:
 * type: array
 * items:
 * type: object
 * properties:
 * gameId:
 * type: string
 * date:
 * type: string
 * resultNumber:
 * type: string
 * 500:
 * description: Server error
 */
router.get('/scrape', scrapeJKSattaAllMonths);

module.exports = router;