import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Routes
app.get("/", (req, res) => res.send("✅ API connected to Azure PostgreSQL!"));

app.get("/forms", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM form_submissions");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/forms", async (req, res) => {
  try {
    const { job_number, data } = req.body;
    await pool.query(
      "INSERT INTO form_submissions (job_number, data) VALUES ($1, $2)",
      [job_number, data]
    );
    res.status(201).send("Form saved ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("Insert failed");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
