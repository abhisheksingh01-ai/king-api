const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const scraperRoutes = require("./routes/scraperRoutes");

const app = express();

// ---------- Middlewares ----------
app.use(express.json());
app.use(cookieParser());

// ✅ FIXED CORS (cookies + frontend)
app.use(
  cors({
    origin: "https://king-frontend-mu.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------- Routes ----------
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/date-number", require("./routes/dateNumber.routes"));
app.use("/api/v1", scraperRoutes);

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

module.exports = app;
