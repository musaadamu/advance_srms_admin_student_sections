const express = require('express');
const { body } = require('express-validator');
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  processPayment,
  refundPayment,
  getPaymentStats,
  applyLateFee,
  waiveLateFee,
  applyDiscount,
  getFinancialReports
} = require('../controllers/paymentController');
const { authenticateToken, requireAdmin, requireStaff } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createPaymentValidation = [
  body('student')
    .isMongoId()
    .withMessage('Valid student ID is required'),
  body('type')
    .isIn(['tuition', 'registration', 'library', 'laboratory', 'examination', 'accommodation', 'meal_plan', 'parking', 'technology', 'health', 'activity', 'graduation', 'transcript', 'late_fee', 'other'])
    .withMessage('Invalid payment type'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('semester')
    .isIn(['Fall', 'Spring', 'Summer'])
    .withMessage('Semester must be Fall, Spring, or Summer'),
  body('academicYear')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY')
];

const updatePaymentValidation = [
  body('type')
    .optional()
    .isIn(['tuition', 'registration', 'library', 'laboratory', 'examination', 'accommodation', 'meal_plan', 'parking', 'technology', 'health', 'activity', 'graduation', 'transcript', 'late_fee', 'other'])
    .withMessage('Invalid payment type'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'overdue', 'cancelled', 'refunded', 'partial'])
    .withMessage('Invalid payment status')
];

const processPaymentValidation = [
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'cash', 'check', 'online', 'mobile_payment', 'scholarship', 'financial_aid'])
    .withMessage('Invalid payment method'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Transaction ID must be between 1 and 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const refundValidation = [
  body('refundAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Refund amount must be a positive number'),
  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Refund reason must be between 5 and 500 characters')
];

// Additional validation rules
const lateFeeValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Late fee amount must be a positive number'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

const discountValidation = [
  body('type')
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be percentage or fixed'),
  body('value')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
];

// Routes
router.get('/', requireStaff, getPayments);
router.get('/stats', requireStaff, getPaymentStats);
router.get('/financial-reports', requireStaff, getFinancialReports);
router.get('/:id', requireStaff, getPaymentById);
router.post('/', requireStaff, createPaymentValidation, createPayment);
router.put('/:id', requireStaff, updatePaymentValidation, updatePayment);
router.post('/:id/process', requireStaff, processPaymentValidation, processPayment);
router.post('/:id/refund', requireAdmin, refundValidation, refundPayment);
router.post('/:id/late-fee', requireStaff, lateFeeValidation, applyLateFee);
router.post('/:id/waive-late-fee', requireStaff, waiveLateFee);
router.post('/:id/discount', requireStaff, discountValidation, applyDiscount);

module.exports = router;
