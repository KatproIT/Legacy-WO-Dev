const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendPowerAutomateRequest } = require('../utils/powerAutomate');

// submit (trigger Power Automate + mark submitted)
router.post('/submit', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'id required' });

    const r = await db.query('SELECT * FROM form_submissions WHERE id = $1', [id]);
    if (r.rows.length === 0) return res.status(404).json({ message: 'Form not found' });

    const saved = r.rows[0];

    // Update status + submitted timestamp
    await db.query(
      'UPDATE form_submissions SET status = $2, submitted_at = now(), data = $3 WHERE id = $1',
      [id, 'submitted', saved.data]
    );

    // send Power Automate notification
    try {
      await sendPowerAutomateRequest(saved);
      await db.query('UPDATE form_submissions SET http_post_sent = true WHERE id = $1', [id]);
    } catch (paErr) {
      console.error('Power Automate failed:', paErr.message || paErr);
    }

    const updated = await db.query('SELECT * FROM form_submissions WHERE id = $1', [id]);
    res.json(updated.rows[0]);

  } catch (err) { next(err); }
});

// reject form
router.post('/reject', async (req, res, next) => {
  try {
    const { id, note } = req.body;

    if (!id || !note)
      return res.status(400).json({ message: 'id and note required' });

    await db.query(
      'UPDATE form_submissions SET is_rejected = true, rejection_note = $2, workflow_timestamp = now() WHERE id = $1',
      [id, note]
    );

    res.json({ ok: true });

  } catch (err) { next(err); }
});

// forward form
router.post('/forward', async (req, res, next) => {
  try {
    const { id, to } = req.body;

    if (!id || !to)
      return res.status(400).json({ message: 'id and to required' });

    await db.query(
      'UPDATE form_submissions SET is_forwarded = true, forwarded_to_email = $2, workflow_timestamp = now() WHERE id = $1',
      [id, to]
    );

    res.json({ ok: true });

  } catch (err) { next(err); }
});

module.exports = router;
