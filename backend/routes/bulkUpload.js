const express = require('express');
const router = express.Router();
const {
  bulkUploadUsers,
  bulkUploadStudents,
  bulkUploadCourses,
  getBulkUploadTemplate
} = require('../controllers/bulkUploadController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All bulk upload routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/bulk-upload/template/:type
// @desc    Get bulk upload template information
// @access  Admin
router.get('/template/:type', getBulkUploadTemplate);

// @route   POST /api/bulk-upload/users
// @desc    Bulk upload users
// @access  Admin
router.post('/users', bulkUploadUsers);

// @route   POST /api/bulk-upload/students
// @desc    Bulk upload students
// @access  Admin
router.post('/students', bulkUploadStudents);

// @route   POST /api/bulk-upload/courses
// @desc    Bulk upload courses
// @access  Admin
router.post('/courses', bulkUploadCourses);

module.exports = router;
