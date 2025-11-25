const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// list all forms (admin)
router.get('/', async (req, res, next) => {
  try {
    const q = `
      SELECT id, job_po_number, technician, status, http_post_sent, 
             is_rejected, is_forwarded, submitted_by_email, 
             created_at, updated_at, data
      FROM form_submissions
      ORDER BY created_at DESC
    `;
    const result = await db.query(q);

    res.set({
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
      "Expires": "0"
    });

    res.json(result.rows);
  } catch (err) { next(err); }
});

// get drafts by user email
router.get('/drafts', async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email parameter required' });
    }

    const result = await db.query(
      `SELECT id, job_po_number, customer, created_at
       FROM form_submissions
       WHERE submitted_by_email = $1 AND is_draft = true
       ORDER BY created_at DESC`,
      [email]
    );

    res.set({
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
      "Expires": "0"
    });

    res.json(result.rows);
  } catch (err) { next(err); }
});

// get form by job_po_number
router.get('/job/:jobNumber', async (req, res, next) => {
  try {
    const { jobNumber } = req.params;
    const result = await db.query(
      `SELECT * FROM form_submissions WHERE job_po_number = $1 LIMIT 1`,
      [jobNumber]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Form not found' });

    res.set({
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
      "Expires": "0"
    });

    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// get form by id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM form_submissions WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Not found' });

    res.set({
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
      "Expires": "0"
    });

    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// create new form
router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;

    if (!payload.job_po_number)
      return res.status(400).json({ message: 'job_po_number required' });

    const id = uuidv4();

    const insert = `
      INSERT INTO form_submissions (
        id, job_po_number, submitted_by_email, technician, customer,
        site_name, site_address, type_of_service,
        contact_name, contact_phone, contact_email,
        next_inspection_due,
        date, status, is_draft, data
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *;
    `;

    const vals = [
      id,
      payload.job_po_number,
      payload.submitted_by_email || null,
      payload.technician || null,
      payload.customer || null,
      payload.site_name || null,
      payload.site_address || null,
      payload.type_of_service || null,
      payload.contact_name || null,
      payload.contact_phone || null,
      payload.contact_email || null,
      payload.next_inspection_due || null,
      payload.date || null,
      payload.status || 'draft',
      payload.is_draft !== undefined ? payload.is_draft : false,
      payload.data || {}
    ];

    const result = await db.query(insert, vals);
    res.status(201).json(result.rows[0]);

  } catch (err) { next(err); }
});

// update form by id
router.put('/:id', async (req, res, next) => {
  try {
    const payload = req.body;

    const q = `
      UPDATE form_submissions SET
        job_po_number = COALESCE($2, job_po_number),
        submitted_by_email = COALESCE($3, submitted_by_email),
        technician = COALESCE($4, technician),
        customer = COALESCE($5, customer),
        site_name = COALESCE($6, site_name),
        site_address = COALESCE($7, site_address),
        type_of_service = COALESCE($8, type_of_service),
        contact_name = COALESCE($9, contact_name),
        contact_phone = COALESCE($10, contact_phone),
        contact_email = COALESCE($11, contact_email),
        next_inspection_due = COALESCE($12, next_inspection_due),
        date = COALESCE($13, date),
        status = COALESCE($14, status),
        is_draft = COALESCE($15, is_draft),
        data = $16
      WHERE id = $1
      RETURNING *;
    `;

    const vals = [
      req.params.id,
      payload.job_po_number || null,
      payload.submitted_by_email || null,
      payload.technician || null,
      payload.customer || null,
      payload.site_name || null,
      payload.site_address || null,
      payload.type_of_service || null,
      payload.contact_name || null,
      payload.contact_phone || null,
      payload.contact_email || null,
      payload.next_inspection_due || null,
      payload.date || null,
      payload.status || null,
      payload.is_draft !== undefined ? payload.is_draft : null,
      payload.data || {}
    ];

    const result = await db.query(q, vals);

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Form not found' });

    res.json(result.rows[0]);

  } catch (err) { next(err); }
});

// delete form
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM form_submissions WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
