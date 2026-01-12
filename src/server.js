// require("dotenv").config();
// const app = require("./app");
// const connectDB = require("./config/db");

// connectDB();

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });

require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

// 1. Establish database connection
// In serverless, we call this but the function itself should handle 
// the "already connected" check to prevent multiple connections.
connectDB();

// 2. Export the app for Vercel
// Vercel takes the Express instance and turns it into a serverless function.
module.exports = app;