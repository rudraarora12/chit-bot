const express = require('express');
const router = express.Router();
const {
  getRiskAlerts,
  getRiskByMemberId,
  analyzeMemberRisk,
} = require('../controllers/riskController');

router.get('/', getRiskAlerts);
router.get('/:memberId', getRiskByMemberId);
router.post('/analyze/:memberId', analyzeMemberRisk);

module.exports = router;
