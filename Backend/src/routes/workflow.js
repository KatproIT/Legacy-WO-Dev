const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendPowerAutomateRequest, sendRejectNotification, sendForwardNotification, calculateEscalation } = require('../utils/powerAutomate');

// submit (trigger Power Automate + mark submitted)
router.post('/submit', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'id required' });

    const r = await db.query('SELECT * FROM form_submissions WHERE id = $1', [id]);
    if (r.rows.length === 0) return res.status(404).json({ message: 'Form not found' });

    const saved = r.rows[0];
    const isResubmission = saved.is_rejected === true;

    // Update status + submitted timestamp + reset workflow fields
    await db.query(
      `UPDATE form_submissions SET
        status = $2,
        submitted_at = now(),
        data = $3,
        is_rejected = false,
        rejection_note = null,
        is_forwarded = false,
        forwarded_to_email = null,
        is_approved = false,
        is_draft = false
      WHERE id = $1`,
      [id, 'submitted', saved.data]
    );

    // Insert workflow history
    const action = isResubmission ? 'resubmitted' : 'submitted';
    await db.query(
      `INSERT INTO workflow_history (form_id, action, actor_email, created_at)
       VALUES ($1, $2, $3, now())`,
      [id, action, saved.submitted_by_email || 'unknown']
    );

    // send Power Automate notification
    try {
      if (isResubmission) {
        // Calculate escalation for resubmission
        const escalation = calculateEscalation(saved);
        // Send resubmission notification via REJECT_URL with escalation flag
        await sendRejectNotification(saved, '', 'resubmitted', escalation);
      } else {
        // Normal submission
        await sendPowerAutomateRequest(saved);
      }
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

    // Get form data before updating
    const formResult = await db.query('SELECT * FROM form_submissions WHERE id = $1', [id]);
    if (formResult.rows.length === 0) {
      return res.status(404).json({ message: 'Form not found' });
    }
    const formData = formResult.rows[0];

    await db.query(
      `UPDATE form_submissions SET
        is_rejected = true,
        rejection_note = $2,
        workflow_timestamp = now(),
        is_approved = false,
        is_forwarded = false
      WHERE id = $1`,
      [id, note]
    );

    // Insert workflow history
    const actorEmail = req.user?.email || 'unknown';
    await db.query(
      `INSERT INTO workflow_history (form_id, action, actor_email, note, created_at)
       VALUES ($1, $2, $3, $4, now())`,
      [id, 'rejected', actorEmail, note]
    );

    // Send Power Automate notification with status: "rejected"
    try {
      await sendRejectNotification(formData, note, 'rejected');
    } catch (paErr) {
      console.error('Power Automate reject failed:', paErr.message || paErr);
    }

    res.json({ ok: true });

  } catch (err) { next(err); }
});

// forward form
router.post('/forward', async (req, res, next) => {
  try {
    const { id, to } = req.body;

    if (!id || !to)
      return res.status(400).json({ message: 'id and to required' });

    // Get form data before updating
    const formResult = await db.query('SELECT * FROM form_submissions WHERE id = $1', [id]);
    if (formResult.rows.length === 0) {
      return res.status(404).json({ message: 'Form not found' });
    }
    const formData = formResult.rows[0];

    await db.query(
      `UPDATE form_submissions SET
        is_forwarded = true,
        forwarded_to_email = $2,
        workflow_timestamp = now(),
        is_approved = false,
        is_rejected = false
      WHERE id = $1`,
      [id, to]
    );

    // Insert workflow history
    const actorEmail = req.user?.email || 'unknown';
    await db.query(
      `INSERT INTO workflow_history (form_id, action, actor_email, forwarded_to_email, created_at)
       VALUES ($1, $2, $3, $4, now())`,
      [id, 'forwarded', actorEmail, to]
    );

    // Send Power Automate notification
    try {
      await sendForwardNotification(formData, to);
    } catch (paErr) {
      console.error('Power Automate forward failed:', paErr.message || paErr);
    }

    res.json({ ok: true });

  } catch (err) { next(err); }
});

// approve form
router.post('/approve', async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id)
      return res.status(400).json({ message: 'id required' });

    // Get form data before updating
    const formResult = await db.query('SELECT * FROM form_submissions WHERE id = $1', [id]);
    if (formResult.rows.length === 0) {
      return res.status(404).json({ message: 'Form not found' });
    }
    const formData = formResult.rows[0];

    await db.query(
      `UPDATE form_submissions SET
        is_approved = true,
        workflow_timestamp = now(),
        is_rejected = false,
        is_forwarded = false
      WHERE id = $1`,
      [id]
    );

    // Insert workflow history
    const actorEmail = req.user?.email || 'unknown';
    await db.query(
      `INSERT INTO workflow_history (form_id, action, actor_email, created_at)
       VALUES ($1, $2, $3, now())`,
      [id, 'approved', actorEmail]
    );

    // Send Power Automate notification with status: "approved"
    try {
      await sendRejectNotification(formData, '', 'approved');
    } catch (paErr) {
      console.error('Power Automate approve failed:', paErr.message || paErr);
    }

    res.json({ ok: true });

  } catch (err) { next(err); }
});

// log general action (save draft, save changes, enable edit)
router.post('/log', async (req, res, next) => {
  try {
    const { formId, action, actorEmail } = req.body;

    if (!formId || !action || !actorEmail)
      return res.status(400).json({ message: 'formId, action, and actorEmail required' });

    await db.query(
      `INSERT INTO workflow_history (form_id, action, actor_email, created_at)
       VALUES ($1, $2, $3, now())`,
      [formId, action, actorEmail]
    );

    res.json({ ok: true });

  } catch (err) { next(err); }
});

// get workflow history for a form
router.get('/history/:formId', async (req, res, next) => {
  try {
    const { formId } = req.params;

    if (!formId)
      return res.status(400).json({ message: 'formId required' });

    const result = await db.query(
      `SELECT * FROM workflow_history
       WHERE form_id = $1
       ORDER BY created_at ASC`,
      [formId]
    );

    res.json(result.rows);

  } catch (err) { next(err); }
});

module.exports = router;
