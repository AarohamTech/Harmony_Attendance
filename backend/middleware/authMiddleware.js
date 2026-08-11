const jwt = require('jsonwebtoken');
const db = require('../config/database');

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_attendance_app_2026_harmony_ai');
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

    const employeeId = req.user.employee_id;
    const userRole = (req.user.role || req.user.designation || '').toLowerCase();

    // Check if role is Manager, Admin, Lead, or HR
    if (userRole.includes('manager') || userRole.includes('admin') || userRole.includes('lead') || userRole.includes('hr')) {
      return next();
    }

    // Query managers database table
    const mgrRes = await db.query('SELECT manager_id FROM managers WHERE employee_id = $1 LIMIT 1', [employeeId]);
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

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.employee_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Authentication token is missing.'
      });
    }

    const userRole = (req.user.role || req.user.designation || '').toLowerCase();
    const isAllowed = allowedRoles.some(role => userRole.includes(role.toLowerCase()));

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

authMiddleware.verifyToken = authMiddleware;
authMiddleware.authMiddleware = authMiddleware;
authMiddleware.requireManager = requireManager;
authMiddleware.requireRole = requireRole;

module.exports = authMiddleware;
