const express = require('express');
const router = express.Router();
const {
  getMySubscription,
  activateDemoSubscription,
  resetDemoSubscription,
} = require('../controllers/subscriptionController');

router.route('/me')
  .get(getMySubscription);

router.route('/demo-activate')
  .post(activateDemoSubscription);

router.route('/demo-reset')
  .post(resetDemoSubscription);

module.exports = router;
