const express= require("express");
const mongoose= require("mongoose");
const cors = require("cors");
require('dotenv').config();
const fs = require('fs');
const app = express();
mongoose.set("strictQuery", false);
const bodyParser = require("body-parser")


//middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

//connection for mongoose database
mongoose
  .connect(process.env.DATABASE_URI, {
          
  })
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Error connecting to database",err));


app.get('/api/test', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'working'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
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
