const router = require("express").Router();
const { getGameChart } = require("../controllers/gameChart.controller");

router.get("/game-chart", getGameChart);

module.exports = router;
