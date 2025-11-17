import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import db from "./db";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors());

// Connect to Azure PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ----------- ROUTES SHOULD START HERE -----------

// Root test
app.get("/", (req, res) => {
  res.send("✅ Backend connected successfully to Azure PostgreSQL!");
});

// Forms list
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

// Insert form
app.post("/forms", async (req, res) => {
  const { data } = req.body;
  try {
    await pool.query("INSERT INTO form_submissions (data) VALUES ($1)", [data]);
    res.status(201).send("Form created successfully ✅");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database insert error" });
  }
});

// REAL DATABASE TEST ROUTE
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

// ----------- LISTEN SHOULD BE LAST -----------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
