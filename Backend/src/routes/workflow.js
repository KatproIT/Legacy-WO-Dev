// src/routes/workflow.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sendPowerAutomateRequest } = require('../utils/powerAutomate');

// POST /api/workflow/submit
router.post('/submit', requireAuth, async (req, res, next) => {
  try {
    const payload = req.body; // should include id or job_po_number
    const id = payload.id;
    if (!id) return res.status(400).json({ message: 'id required' });

    // update status + timestamps
    const q = `
      UPDATE form_submissions
      SET status = 'submitted', submitted_at = now(), data = $2
      WHERE id = $1
      RETURNING *;
    `;
    const result = await db.query(q, [id, payload]);
    const saved = result.rows[0];

    // send power automate
    try {
      await sendPowerAutomateRequest(saved);
      await db.query('UPDATE form_submissions SET http_post_sent = true WHERE id = $1', [id]);
    } catch (paErr) {
      console.error('Power Automate failed', paErr);
    }

    res.json(saved);
  } catch (err) { next(err); }
});

// POST /api/workflow/reject
router.post('/reject', requireAuth, async (req, res, next) => {
  try {
    const { id, note } = req.body;
    if (!id || !note) return res.status(400).json({ message: 'id and note required' });

    await db.query(
      `UPDATE form_submissions SET is_rejected = true, rejection_note = $2, workflow_timestamp = now() WHERE id = $1`,
      [id, note]
    );

    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/workflow/forward
router.post('/forward', requireAuth, async (req, res, next) => {
  try {
    const { id, to } = req.body;
    if (!id || !to) return res.status(400).json({ message: 'id and to required' });

    await db.query(
      `UPDATE form_submissions SET is_forwarded = true, forwarded_to_email = $2, workflow_timestamp = now() WHERE id = $1`,
      [id, to]
    );

    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
