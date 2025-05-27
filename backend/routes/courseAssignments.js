const express = require('express');
const router = express.Router();
const {
  getDepartmentAssignments,
  getLecturerAssignments,
  assignCourse,
  updateAssignment,
  cancelAssignment,
  getAvailableLecturers,
  getAvailableCourses
} = require('../controllers/courseAssignmentController');
const { authenticateToken, requireStaff } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);
router.use(requireStaff);

// @route   GET /api/course-assignments/department
// @desc    Get all course assignments for a department
// @access  Staff (HOD/Admin)
router.get('/department', getDepartmentAssignments);

// @route   GET /api/course-assignments/lecturer/:lecturerId
// @desc    Get lecturer's course assignments
// @access  Staff
router.get('/lecturer/:lecturerId', getLecturerAssignments);

// @route   POST /api/course-assignments/assign
// @desc    Assign course to lecturer
// @access  Staff (HOD/Admin)
router.post('/assign', assignCourse);

// @route   PUT /api/course-assignments/:assignmentId
// @desc    Update course assignment
// @access  Staff (HOD/Admin)
router.put('/:assignmentId', updateAssignment);

// @route   DELETE /api/course-assignments/:assignmentId
// @desc    Cancel course assignment
// @access  Staff (HOD/Admin)
router.delete('/:assignmentId', cancelAssignment);

// @route   GET /api/course-assignments/available-lecturers
// @desc    Get available lecturers for assignment
// @access  Staff (HOD/Admin)
router.get('/available-lecturers', getAvailableLecturers);

// @route   GET /api/course-assignments/available-courses
// @desc    Get courses available for assignment
// @access  Staff (HOD/Admin)
router.get('/available-courses', getAvailableCourses);

module.exports = router;
