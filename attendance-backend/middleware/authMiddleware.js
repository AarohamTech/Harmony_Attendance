const jwt = require('jsonwebtoken');
const db = require('../config/database');
const requireRole = require('./roleMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || '08ce0113a09b73847b1980bb73db7bf9f62edc71b9488663bcf48bc5704f65e3cd0aa30be9aaf02b704f45f73d772c1d72260e274e9f715d0dfc392c4682c1ab';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access. Authentication token is missing.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access. Invalid or expired token.'
    });
  }
};

const requireManager = async (req, res, next) => {
  try {
    if (!req.user || !req.user.employee_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Authentication token is missing.'
      });
    }

    const userRole = (req.user.role || '').toLowerCase();

    // Check if role is Manager, Admin, or HR
    if (['manager', 'admin', 'hr'].includes(userRole)) {
      return next();
    }

    // Query managers database table
    const mgrRes = await db.query('SELECT manager_id FROM managers WHERE employee_id = $1 LIMIT 1', [req.user.employee_id]);
    if (mgrRes.rows.length > 0) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. Manager permissions required for this action.'
    });
  } catch (err) {
    next(err);
  }
};

authMiddleware.verifyToken = authMiddleware;
authMiddleware.authMiddleware = authMiddleware;
authMiddleware.requireManager = requireManager;
authMiddleware.requireRole = requireRole;

module.exports = authMiddleware;
