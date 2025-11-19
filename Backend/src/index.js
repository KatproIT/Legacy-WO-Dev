require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const formsRouter = require('./routes/forms');
const workflowRouter = require('./routes/workflow');

// 🔥 NEW AUTH IMPORTS
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;
  
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*'
}));

// 🔥 FIX: Disable caching (prevents 304 Not Modified)
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});
app.use('/api/auth', authRouter); // auth routes

app.use(bodyParser.json({ limit: '20mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// ⭐ PUBLIC AUTH ROUTES
app.use('/api/auth', authRouter);

// ⭐ PROTECTED ROUTES
app.use('/api/forms', authMiddleware, formsRouter);
app.use('/api/workflow', authMiddleware, workflowRouter);

// simple error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('/api/debug-env', (req, res) => {
  res.json({
    AZURE_POSTGRES_URL: process.env.AZURE_POSTGRES_URL || null,
    DB_SSL: process.env.DB_SSL || null
  });
});
