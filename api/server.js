import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import db from "./db.js";   // IMPORTANT: .js extension

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors());

// -----------------------------------------
// DATABASE CONNECTION (Pool is optional; db.js already handles it)
// -----------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// -----------------------------------------
// ROUTES MUST BE ABOVE app.listen()
// -----------------------------------------

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ Backend connected successfully to Azure PostgreSQL!");
});

// Fetch latest form submissions
app.get("/forms", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 10;"
    );
    res.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Insert a new form submission
app.post("/forms", async (req, res) => {
  const { data } = req.body;
  try {
    await pool.query("INSERT INTO form_submissions (data) VALUES ($1)", [data]);
    res.status(201).send("Form created successfully ✅");
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Database insert error" });
  }
});

// REAL DB TEST ROUTE
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

// -----------------------------------------
// START SERVER (MUST COME LAST)
// -----------------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
