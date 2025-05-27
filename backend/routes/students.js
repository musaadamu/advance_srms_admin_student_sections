const express = require('express');
const { body } = require('express-validator');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollInCourse,
  getStudentStats
} = require('../controllers/studentController');
const { authenticateToken, requireAdmin, requireStaff } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createStudentValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('studentId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters'),
  body('program')
    .notEmpty()
    .withMessage('Program is required'),
  body('year')
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6'),
  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8')
];

const updateStudentValidation = [
  body('userData.firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('userData.lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('userData.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('studentData.program')
    .optional()
    .notEmpty()
    .withMessage('Program cannot be empty'),
  body('studentData.year')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6'),
  body('studentData.semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8')
];

const enrollValidation = [
  body('courseId')
    .isMongoId()
    .withMessage('Valid course ID is required')
];

// Routes
router.get('/', requireStaff, getStudents);
router.get('/stats', requireStaff, getStudentStats);
router.get('/:id', requireStaff, getStudentById);
router.post('/', requireAdmin, createStudentValidation, createStudent);
router.put('/:id', requireAdmin, updateStudentValidation, updateStudent);
router.delete('/:id', requireAdmin, deleteStudent);
router.post('/:id/enroll', requireStaff, enrollValidation, enrollInCourse);

module.exports = router;
