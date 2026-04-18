const express= require("express");
const mongoose= require("mongoose");
const morgan = require("morgan");
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cors = require("cors");
const app = express();
mongoose.set("strictQuery", false);
const bodyParser = require("body-parser");
const logger = require("./utils/logger");

// ─── HTTP request logging ────────────────────────────────────────
// 'combined' format in production (Apache-style for Vercel logs), 'dev' locally
const morganFormat = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
  ? 'combined'
  : 'dev';
app.use(morgan(morganFormat));

// ─── CORS ────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://prodeazyshop.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://prodeazyshop.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(bodyParser.urlencoded({ extended: false }));


// automated routes
const routesPath = path.join(__dirname, 'modules');
fs.readdirSync(routesPath).forEach((dir) => {
  const modulePath = path.join(routesPath, dir);
  if (fs.statSync(modulePath).isDirectory()) {
    // Look for files ending with .routes.js in each module folder
    const routeFiles = fs.readdirSync(modulePath).filter(f => f.endsWith('.routes.js'));
    routeFiles.forEach((file) => {
      app.use("/api", require(path.join(modulePath, file)));
    });
  }
});

// Export app for Vercel (serverless — no listen needed)
module.exports = app;

// Only listen when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => logger.info(`Server listening on port ${port}`));
}
