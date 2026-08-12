const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.employee_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = (req.user.role || '').trim();

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const isAllowed = allowedRoles.some(
      role => role.toLowerCase() === userRole.toLowerCase()
    );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();
  };
};

module.exports = requireRole;
