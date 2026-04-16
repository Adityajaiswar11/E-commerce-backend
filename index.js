const express= require("express");
const mongoose= require("mongoose");
const cors = require("cors");
require('dotenv').config();
const fs = require('fs');
const app = express();
mongoose.set("strictQuery", false);
const bodyParser = require("body-parser");
const Product = require("./models/productModel");

//middleware
app.use(cors());
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
const routesPath = "./routes";
const routeFiles = fs.readdirSync(routesPath);
routeFiles.map((r) => app.use("/api", require(`./routes/${r}`)));

//app listener
const port = process.env.PORT || 3000;

app.listen(port, console.log(`server is listening on ${port}`));
