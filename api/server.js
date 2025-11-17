import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors());

// 🧩 Connect to your Azure PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🧪 Test Route
app.get("/", (req, res) => {
  res.send("✅ Backend connected successfully to Azure PostgreSQL!");
});

// 🧩 Example API: Fetch all form submissions
app.get("/forms", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 10;");
    res.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🧩 Example API: Add a new form (for later use)
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

