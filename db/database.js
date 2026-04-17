const mongoose = require("mongoose");
let cached = global.mongoose || { conn: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.conn = await mongoose.connect(process.env.DATABASE_URI, {
    bufferCommands: false,
  });

  return cached.conn;
}

module.exports = { connectDB };