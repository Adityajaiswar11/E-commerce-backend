const express= require("express");
const mongoose= require("mongoose");
const cors = require("cors");
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = express();
mongoose.set("strictQuery", false);
const bodyParser = require("body-parser");

//middleware
const allowedOrigins = [
  "http://localhost:5173",        // local dev
  "https://prodeazyshop.vercel.app",  // production frontend
  "https://deveasyshop.vercel.app" // staging frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,            // if you send cookies/auth headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// IMPORTANT: Handle preflight OPTIONS for all routes
app.options("*", cors());

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // Saves the raw bytes so Razorpay's hash doesn't break!
  }
}));

app.use(bodyParser.urlencoded({ extended: false }));

//connection for mongoose database
mongoose
  .connect(process.env.DATABASE_URI, {
          
  })
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Error connecting to database",err));



app.get('/api/test', async (req, res) => {
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
  app.listen(port, () => console.log(`server is listening on ${port}`));
}
