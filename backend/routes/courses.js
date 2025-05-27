const express = require('express');
const { body } = require('express-validator');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats
} = require('../controllers/courseController');
const { authenticateToken, requireAdmin, requireStaff } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createCourseValidation = [
  body('courseCode')
    .trim()
    .matches(/^[A-Z]{2,4}\d{3,4}$/)
    .withMessage('Course code must be in format like CS101 or MATH1001'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Course description must be between 10 and 1000 characters'),
  body('credits')
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
  body('level')
    .isIn(['undergraduate', 'graduate', 'postgraduate'])
    .withMessage('Level must be undergraduate, graduate, or postgraduate'),
  body('department')
    .notEmpty()
    .withMessage('Department is required'),
  body('instructor')
    .isMongoId()
    .withMessage('Valid instructor ID is required'),
  body('maxEnrollment')
    .isInt({ min: 1 })
    .withMessage('Maximum enrollment must be at least 1'),
  body('schedule.semester')
    .isIn(['Fall', 'Spring', 'Summer'])
    .withMessage('Semester must be Fall, Spring, or Summer'),
  body('schedule.year')
    .isInt({ min: 2020 })
    .withMessage('Year must be 2020 or later')
];

const updateCourseValidation = [
  body('courseCode')
    .optional()
    .trim()
    .matches(/^[A-Z]{2,4}\d{3,4}$/)
    .withMessage('Course code must be in format like CS101 or MATH1001'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Course description must be between 10 and 1000 characters'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
  body('level')
    .optional()
    .isIn(['undergraduate', 'graduate', 'postgraduate'])
    .withMessage('Level must be undergraduate, graduate, or postgraduate'),
  body('instructor')
    .optional()
    .isMongoId()
    .withMessage('Valid instructor ID is required'),
  body('maxEnrollment')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum enrollment must be at least 1'),
  body('schedule.semester')
    .optional()
    .isIn(['Fall', 'Spring', 'Summer'])
    .withMessage('Semester must be Fall, Spring, or Summer'),
  body('schedule.year')
    .optional()
    .isInt({ min: 2020 })
    .withMessage('Year must be 2020 or later')
];

// Routes
router.get('/', requireStaff, getCourses);
router.get('/stats', requireStaff, getCourseStats);
router.get('/:id', requireStaff, getCourseById);
router.post('/', requireStaff, createCourseValidation, createCourse);
router.put('/:id', requireStaff, updateCourseValidation, updateCourse);
router.delete('/:id', requireAdmin, deleteCourse);

module.exports = router;
