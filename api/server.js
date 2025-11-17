// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import formsRouter from "./routes/forms.js";
import pkg from "pg";
import db from "./db.js"; // your existing db.js
import formsRouter from "./routes/forms.js";
app.use("/forms", formsRouter);
dotenv.config();

const app = express();
app.use(express.json());

// CORS: allow your static app + localhost for dev
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || "https://nice-mud-0c7aa8500.3.azurestaticapps.net",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed"), false);
  }
}));

// health / root
app.get("/", (req, res) => {
  res.send("✅ Backend connected successfully to Azure PostgreSQL!");
});

// keep your existing DB test route
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await db.query("SELECT COUNT(*) FROM form_submissions;");
    res.json({
      success: true,
      connected: true,
      rows: result.rows[0].count
    });
  } catch (err) {
    console.error("DB Test Error:", err);
    res.status(500).json({
      success: false,
      connected: false,
      error: err.message
    });
  }
});

// mount forms routes
app.use("/forms", formsRouter);

// start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
