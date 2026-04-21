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
const cartRoutes = require("./modules/cart/cart.routes");

// ─── HTTP request logging ────────────────────────────────────────
const morganFormat = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// ─── CORS ────────────────────────────────────────────────────────
const allowedOrigins = ["http://localhost:5173", "https://prodeazyshop.vercel.app"];
app.use(cors({
  origin: allowedOrigins,
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
app.use("/api", cartRoutes);

app.get("/", (req, res) => {
  res.json({ msg: "server is running",status:200 });
});

// error handler
app.use(globalErrorMiddleware);

module.exports = app;

if (process.env.VERCEL !== '1') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => logger.info(`Server listening on port ${port}`));
}
