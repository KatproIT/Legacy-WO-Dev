const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');


// list all forms (admin)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    // return top-level columns plus data
    const q = `SELECT id, job_po_number, technician, status, http_post_sent, is_rejected, is_forwarded, submitted_by_email, created_at, updated_at, data
               FROM form_submissions
               ORDER BY created_at DESC`;
    const result = await db.query(q);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// get form by job_po_number
router.get('/job/:jobNumber', requireAuth, async (req, res, next) => {
  try {
    const { jobNumber } = req.params;
    const q = `SELECT * FROM form_submissions WHERE job_po_number = $1 LIMIT 1`;
    const result = await db.query(q, [jobNumber]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Form not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// get form by id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM form_submissions WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// create new form
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload.job_po_number) return res.status(400).json({ message: 'job_po_number required' });

    // check duplicate
    const dup = await db.query('SELECT id FROM form_submissions WHERE job_po_number = $1', [payload.job_po_number]);
    if (dup.rows.length) {
      return res.status(409).json({ message: `Job/PO # "${payload.job_po_number}" already exists.` });
    }

    const id = uuidv4();
    const insert = `
      INSERT INTO form_submissions (
        id, job_po_number, submitted_by_email, technician, customer, site_name,
        date, status, data
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;
    `;
    const vals = [
      id,
      payload.job_po_number,
      payload.submitted_by_email || null,
      payload.technician || null,
      payload.customer || null,
      payload.site_name || null,
      payload.date || null,
      payload.status || 'draft',
      payload
    ];
    const result = await db.query(insert, vals);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// update by id
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // update top-level columns where present, store full payload in data
    const q = `
      UPDATE form_submissions SET
        job_po_number = COALESCE($2, job_po_number),
        submitted_by_email = COALESCE($3, submitted_by_email),
        technician = COALESCE($4, technician),
        customer = COALESCE($5, customer),
        site_name = COALESCE($6, site_name),
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
      payload.technician || null,
      payload.customer || null,
      payload.site_name || null,
      payload.date || null,
      payload.status || null,
      payload
    ];
    const result = await db.query(q, vals);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Form not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// delete
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM form_submissions WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
