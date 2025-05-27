// Admin authentication middleware
// This middleware ensures only admin users can access certain routes

const adminAuth = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        error: 'INSUFFICIENT_PERMISSIONS',
        required: 'admin',
        current: req.user.role
      });
    }

    // User is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization error',
      error: 'AUTH_ERROR'
    });
  }
};

module.exports = adminAuth;
