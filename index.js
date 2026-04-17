const express= require("express");
const mongoose= require("mongoose");
const morgan = require("morgan");
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = express();
mongoose.set("strictQuery", false);
const bodyParser = require("body-parser");
const { connectDB } = require("./db/database");
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
    req.rawBody = buf.toString(); // Saves the raw bytes so Razorpay's hash doesn't break!
  }
}));

app.use(bodyParser.urlencoded({ extended: false }));

//connection for mongoose database
connectDB()
  .then(() => logger.info('Database connected'))
  .catch((err) => logger.error('Database connection failed', { error: err.message }));

app.get('/', async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message:'server is running'
      
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});




//automated routes
const routesPath = path.join(__dirname, 'routes');
const routeFiles = fs.readdirSync(routesPath).filter(f => f.endsWith('.js'));
routeFiles.forEach((r) => app.use("/api", require(path.join(routesPath, r))));

// Export app for Vercel (serverless — no listen needed)
module.exports = app;

// Only listen when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => logger.info(`Server listening on port ${port}`));
}
