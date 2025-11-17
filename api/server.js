import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import db from "./db.js";


dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors());

// Test root
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// REAL DATABASE TEST
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await db.query("SELECT COUNT(*) FROM form_submissions;");
    res.json({
      success: true,
      connected: true,
      rows: result.rows[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      connected: false,
      error: err.message
    });
  }
});

// Start server (must be last)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
export default app;