const router = require("express").Router();
const {
  addDateNumber,
  updateNumber,
  getAllDateNumbers,
} = require("../controllers/dateNumber.controller");

/**
 * @swagger
 * tags:
 *   name: DateNumber
 *   description: Date and Number Management
 */

/**
 * @swagger
 * /api/date-number:
 *   get:
 *     summary: Get all dates with numbers (Dashboard)
 *     tags: [DateNumber]
 *     responses:
 *       200:
 *         description: List fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       date:
 *                         type: string
 *                         example: "12-01-2026"
 *                       number:
 *                         type: number
 *                         example: 45
 */
router.get("/", getAllDateNumbers);

/**
 * @swagger
 * /api/date-number:
 *   post:
 *     summary: Add date and number
 *     tags: [DateNumber]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - number
 *             properties:
 *               date:
 *                 type: string
 *                 example: "12-01-2026"
 *               number:
 *                 type: number
 *                 example: 23
 *     responses:
 *       201:
 *         description: Added successfully
 */
router.post("/", addDateNumber);

/**
 * @swagger
 * /api/date-number/{date}:
 *   put:
 *     summary: Update number by date
 *     tags: [DateNumber]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         example: "12-01-2026"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *             properties:
 *               number:
 *                 type: number
 *                 example: 45
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/:date", updateNumber);


module.exports = router;
