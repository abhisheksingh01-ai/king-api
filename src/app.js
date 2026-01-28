const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUI = require("swagger-ui-express");
const compression = require("compression"); // 🔥 PERFORMANCE
const helmet = require("helmet"); // 🔥 SECURITY
const swaggerSpec = require("./config/swagger");

const scraperRoutes = require("./routes/scraperRoutes");
const admin = require("./scripts/setUpAdmins");
const gameChartRoutes = require("./routes/gameChart.routes");

const app = express();

// 🔥 PROXY TRUST: Required for 'secure' cookies on Vercel/Heroku/AWS
app.set("trust proxy", 1);

// ---------- Middlewares ----------

// 1. Security Headers
app.use(helmet());

// 2. Compression (Huge Bandwidth Saving)
// Compresses all responses (JSON/HTML) automatically
app.use(compression());

// 3. Body Parsing
app.use(express.json({ limit: "1mb" })); // Prevent large payload attacks
app.use(cookieParser());

// 4. Optimized CORS
const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://king-frontend-mu.vercel.app",
  "https://new-king-six.vercel.app"
]);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // O(1) Lookup is faster than Array.indexOf
      if (allowedOrigins.has(origin)) {
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
app.use("/api", gameChartRoutes);

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.json({ 
    status: "API running", 
    timestamp: new Date().toISOString() 
  });
});

module.exports = app;