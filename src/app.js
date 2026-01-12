const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const scraperRoutes = require('./routes/scraperRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/date-number", require("./routes/dateNumber.routes"));

app.use('/api/v1', scraperRoutes);

module.exports = app;
