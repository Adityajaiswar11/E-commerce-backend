const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.get("/test", (req, res) => {
  return res.json({ msg: "working" });
});

module.exports = serverless(app);