const router = require("express").Router();
const { getGameChart } = require("../controllers/gameChart.controller");

const cacheMedium = (req, res, next) => {
  res.set("Cache-Control", "public, max-age=60");
  next();
};

router.get("/game-chart", cacheMedium, getGameChart);

module.exports = router;
