const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentMembers,
  getPaymentSummary,
} = require('../controllers/dashboardController');

router.get('/stats', getDashboardStats);
router.get('/recent-members', getRecentMembers);
router.get('/payment-summary', getPaymentSummary);

module.exports = router;
