const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  updateUserRole,
  getUserStats
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Routes
router.get('/', requireAdmin, getUsers);
router.get('/stats', requireAdmin, getUserStats);
router.get('/:id', requireAdmin, getUserById);
router.put('/:id', requireAdmin, updateUserValidation, updateUser);
router.delete('/:id', requireAdmin, deleteUser);
router.patch('/:id/activate', requireAdmin, activateUser);
router.patch('/:id/role', requireAdmin, updateUserRole);

module.exports = router;
