// /mnt/data/src/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../../db'); // adjust path if your routes live elsewhere
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/hash');

// Require auth middleware + superAdminOnly
const authMiddleware = require('../middleware/auth');
const superAdminOnly = require('../middleware/superAdminOnly');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const DEFAULT_PASSWORD_FOR_NEW_USERS = '12345678';

// LOGIN
// POST { email, password } -> { token, user: { id, email, role } }
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password required' });
    }

    const q = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
    const r = await db.query(q, [email.toLowerCase().trim()]);
    if (r.rows.length === 0) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const user = r.rows[0];
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// CHANGE PASSWORD (logged in)
// POST { oldPassword, newPassword }
router.post('/change-password', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const { oldPassword, newPassword } = req.body || {};

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'oldPassword and newPassword required' });
    }

    const r = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [decoded.id]);
    if (r.rows.length === 0) {
      return res.status(404).json({ message: 'user not found' });
    }

    const user = r.rows[0];
    const ok = await comparePassword(oldPassword, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'invalid old password' });
    }

    const newHash = await hashPassword(newPassword);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      newHash,
      user.id,
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// RESET PASSWORD (superadmin-protected flow)
// POST { email, newPassword, superadminPassword }
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, newPassword, superadminPassword } = req.body || {};
    if (!email || !newPassword || !superadminPassword) {
      return res
        .status(400)
        .json({ message: 'email, newPassword and superadminPassword required' });
    }

    // find superadmin account
    const saRes = await db.query(
      "SELECT * FROM users WHERE role = 'superadmin' LIMIT 1"
    );
    if (saRes.rows.length === 0) {
      return res.status(500).json({ message: 'superadmin not configured' });
    }

    const superadmin = saRes.rows[0];
    const okSA = await comparePassword(
      superadminPassword,
      superadmin.password_hash
    );
    if (!okSA) {
      return res.status(401).json({ message: 'invalid superadmin password' });
    }

    // find user to reset
    const targetRes = await db.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    if (targetRes.rows.length === 0) {
      return res.status(404).json({ message: 'user not found' });
    }

    const newHash = await hashPassword(newPassword);
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [newHash, email.toLowerCase().trim()]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Create user (superadmin only)
// POST { email, role } -> { ok: true, defaultPassword }
router.post(
  '/create-user',
  authMiddleware,
  superAdminOnly,
  async (req, res, next) => {
    try {
      const { email, role } = req.body || {};
      if (!email || !role) {
        return res.status(400).json({ message: 'email and role required' });
      }

      // basic validation for role - only allow pm, technician, admin
      const allowed = ['pm', 'technician', 'admin'];
      if (!allowed.includes(role)) {
        return res.status(400).json({ message: 'invalid role' });
      }

      // check exists
      const existing = await db.query(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        [email.toLowerCase().trim()]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'user already exists' });
      }

      const passwordHash = await hashPassword(DEFAULT_PASSWORD_FOR_NEW_USERS);

      await db.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
        [email.toLowerCase().trim(), passwordHash, role]
      );

      res.json({ ok: true, defaultPassword: DEFAULT_PASSWORD_FOR_NEW_USERS });
    } catch (err) {
      next(err);
    }
  }
);

// List users (superadmin only)
// GET -> [{ id, email, role, created_at }]
router.get('/users', authMiddleware, superAdminOnly, async (req, res, next) => {
  try {
    const r = await db.query(
      'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(r.rows || []);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
