const express= require("express");
const mongoose= require("mongoose");
const morgan = require("morgan");
require('dotenv').config();
const fs = require('fs');
const path = require('path');
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
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
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
