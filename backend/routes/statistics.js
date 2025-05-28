const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/statisticsController');

// Get comprehensive dashboard statistics
router.get('/dashboard', auth, getDashboardStats);

module.exports = router;
