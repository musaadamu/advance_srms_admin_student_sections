const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/statisticsController');

// Get comprehensive dashboard statistics
router.get('/dashboard', authenticateToken, getDashboardStats);

module.exports = router;
