// src/routes/forms.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');

// GET /api/forms - list all
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM form_submissions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/forms/:jobNumber
router.get('/:jobNumber', requireAuth, async (req, res, next) => {
  try {
    const { jobNumber } = req.params;
    const result = await db.query('SELECT * FROM form_submissions WHERE job_po_number = $1 LIMIT 1', [jobNumber]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Form not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// POST /api/forms - create
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = req.body;
    // Ensure job_po_number exists
    if (!payload.job_po_number) return res.status(400).json({ message: 'job_po_number required' });

    // Check duplicate job_po_number
    const existing = await db.query('SELECT id FROM form_submissions WHERE job_po_number = $1', [payload.job_po_number]);
    if (existing.rows.length) {
      return res.status(409).json({ message: `Job/PO # "${payload.job_po_number}" already exists.` });
    }

    const insert = `
      INSERT INTO form_submissions (id, job_po_number, submitted_by_email, customer, site_name, technician, date, status, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;
    const id = uuidv4();
    const values = [
      id,
      payload.job_po_number,
      payload.submitted_by_email || null,
      payload.customer || null,
      payload.site_name || null,
      payload.technician || null,
      payload.date ? payload.date : null,
      payload.status || 'draft',
      payload // store full payload in JSONB column
    ];
    const result = await db.query(insert, values);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/forms/:id - update by id
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    // Save full payload into data column and update key columns if present
    const q = `
      UPDATE form_submissions
      SET
        job_po_number = COALESCE($2, job_po_number),
        submitted_by_email = COALESCE($3, submitted_by_email),
        customer = COALESCE($4, customer),
        site_name = COALESCE($5, site_name),
        technician = COALESCE($6, technician),
        date = COALESCE($7, date),
        status = COALESCE($8, status),
        data = $9
      WHERE id = $1
      RETURNING *;
    `;
    const vals = [
      id,
      payload.job_po_number || null,
      payload.submitted_by_email || null,
      payload.customer || null,
      payload.site_name || null,
      payload.technician || null,
      payload.date || null,
      payload.status || null,
      payload
    ];
    const result = await db.query(q, vals);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Form not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/forms/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM form_submissions WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
