require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const formsRouter = require('./routes/forms');
const workflowRouter = require('./routes/workflow');

// Auth
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

/* -------------------------------------------------------
   ✅ CORS (MUST be FIRST middleware)
-------------------------------------------------------- */
app.use((req, res, next) => {
  const origin = process.env.FRONTEND_ORIGIN || "https://legacywo.ontivity.com";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

/* -------------------------------------------------------
   ✅ Disable caching (AFTER CORS)
-------------------------------------------------------- */
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

/* -------------------------------------------------------
   Body parser
-------------------------------------------------------- */
app.use(bodyParser.json({ limit: "20mb" }));

/* -------------------------------------------------------
   Public Endpoints
-------------------------------------------------------- */
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Auth routes (LOGIN, RESET-PASSWORD, CREATE-USER)
app.use("/api/auth", authRouter);

// Public form view (no auth required) - only submitted forms
app.get("/api/public/form/:id", async (req, res, next) => {
  try {
    const db = require('./db');
    const result = await db.query(
      'SELECT * FROM form_submissions WHERE id = $1 AND (is_draft = false OR is_draft IS NULL)',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Form not found or not accessible' });
    }

    res.set({
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
      "Expires": "0"
    });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/* -------------------------------------------------------
   Protected Endpoints (Require JWT)
-------------------------------------------------------- */
app.use("/api/forms", authMiddleware, formsRouter);
app.use("/api/workflow", authMiddleware, workflowRouter);

/* -------------------------------------------------------
   Error Handler
-------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

/* -------------------------------------------------------
   Server start
-------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

/* -------------------------------------------------------
   Env debug
-------------------------------------------------------- */
app.get("/api/debug-env", (req, res) => {
  res.json({
    AZURE_POSTGRES_URL: process.env.AZURE_POSTGRES_URL || null,
    DB_SSL: process.env.DB_SSL || null,
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || null,
  });
});
