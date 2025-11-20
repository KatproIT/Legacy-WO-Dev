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
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "https://brave-dune-07628650f.3.azurestaticapps.net",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
}));
app.options('*', cors());

// Enable preflight requests for all routes
app.options("*", cors());

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
