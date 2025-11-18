// src/index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const formsRouter = require('./routes/forms');
const workflowRouter = require('./routes/workflow');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*' // tighten in production
}));
app.use(bodyParser.json({ limit: '10mb' }));

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// routes
app.use('/api/forms', formsRouter);
app.use('/api/workflow', workflowRouter);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
