const express= require("express");
const serverless = require("serverless-http");
const morgan = require("morgan");
require('dotenv').config();
const cors = require("cors")
const app = express();  
const bodyParser = require("body-parser");
const logger = require("./utils/logger");
const corsMiddleware = require("./middleware/cors");
const globalErrorMiddleware = require("./middleware/globalError");
const productsRoutes = require("./modules/products/products.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const authRoutes = require("./modules/auth/auth.routes");

// ─── HTTP request logging ────────────────────────────────────────
const morganFormat = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// ─── CORS ────────────────────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());
app.use(corsMiddleware);

// raw body
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(bodyParser.urlencoded({ extended: false }));

//routes
app.use("/api", authRoutes);
app.use("/api", productsRoutes);
app.use("/api", paymentRoutes);

app.get("/", (req, res) => {
  res.json({ msg: "server is running",status:200 });
});

// error handler
app.use(globalErrorMiddleware);

// Export app for Vercel (serverless — no listen needed)
module.exports = app;

// Only listen when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => logger.info(`Server listening on port ${port}`));
}
