const express = require('express');
const router = express.Router();
const {
  getCourseResults,
  uploadResult,
  submitCourseResults,
  getStudentResults,
  approveResults,
  publishResults
} = require('../controllers/resultsController');
const { authenticateToken, requireStaff, requireStudent } = require('../middleware/auth');

// @route   GET /api/results/course/:assignmentId
// @desc    Get results for a course assignment (Lecturer view)
// @access  Staff (Lecturer)
router.get('/course/:assignmentId', authenticateToken, requireStaff, getCourseResults);

// @route   PUT /api/results/course/:assignmentId/student/:studentId
// @desc    Upload/Update student result
// @access  Staff (Lecturer)
router.put('/course/:assignmentId/student/:studentId', authenticateToken, requireStaff, uploadResult);

// @route   POST /api/results/course/:assignmentId/submit
// @desc    Submit all results for a course
// @access  Staff (Lecturer)
router.post('/course/:assignmentId/submit', authenticateToken, requireStaff, submitCourseResults);

// @route   GET /api/results/student
// @desc    Get student results
// @access  Student
router.get('/student', authenticateToken, requireStudent, getStudentResults);

// @route   POST /api/results/course/:assignmentId/approve
// @desc    Approve results (HOD/Admin)
// @access  Staff (HOD/Admin)
router.post('/course/:assignmentId/approve', authenticateToken, requireStaff, approveResults);

// @route   POST /api/results/course/:assignmentId/publish
// @desc    Publish results (Make visible to students)
// @access  Staff (HOD/Admin)
router.post('/course/:assignmentId/publish', authenticateToken, requireStaff, publishResults);

module.exports = router;
