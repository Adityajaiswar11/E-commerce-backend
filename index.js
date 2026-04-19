const express= require("express");
const serverless = require("serverless-http");
const morgan = require("morgan");
require('dotenv').config();
const cors = require("cors")
const app = express();  
const bodyParser = require("body-parser");
const logger = require("./utils/logger");

// ─── HTTP request logging ────────────────────────────────────────
// 'combined' format in production (Apache-style for Vercel logs), 'dev' locally
const morganFormat = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
  ? 'combined'
  : 'dev';
app.use(morgan(morganFormat));

// ─── CORS ────────────────────────────────────────────────────────

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(bodyParser.urlencoded({ extended: false }));

//routes
app.use("/api", require("./modules/auth/auth.routes"));
app.use("/api", require("./modules/products/products.routes"));
app.use("/api", require("./modules/payment/payment.routes"));

// Export app for Vercel (serverless — no listen needed)
module.exports = serverless(app);

// Only listen when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => logger.info(`Server listening on port ${port}`));
}
