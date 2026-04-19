const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.get("/", (req, res) => {
  return res.json({ msg: "server is running",status:200 });
});

module.exports = serverless(app);