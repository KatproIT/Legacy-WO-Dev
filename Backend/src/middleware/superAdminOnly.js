// /mnt/data/src/middleware/superAdminOnly.js
// Middleware to require that req.user exists (set by auth middleware)
// and that req.user.role === 'superadmin'

module.exports = function superAdminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: requires superadmin' });
  }
  next();
};
