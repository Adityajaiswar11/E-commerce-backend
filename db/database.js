const mongoose = require("mongoose");

// Cache the connection across Vercel serverless invocations
let cached = global.mongoose || { conn: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  cached.conn = await mongoose.connect(process.env.DATABASE_URI);
  return cached.conn;
}

module.exports = { connectDB };