const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const scraperRoutes = require("./routes/scraperRoutes");
const admin = require("./scripts/setUpAdmins");

const app = express();

// ---------- Middlewares ----------
app.use(express.json());
app.use(cookieParser());

// ✅ FIXED CORS (cookies + frontend)
const allowedOrigins = [
  "http://localhost:5173",               
  "https://king-frontend-mu.vercel.app"  
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------- Routes ----------
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api/setup-admin", admin);
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/date-number", require("./routes/dateNumber.routes"));
app.use("/api/v1", scraperRoutes);

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

module.exports = app;
