const express = require('express');
const router = express.Router();
const {
  getContributions,
  getContributionById,
  createContribution,
} = require('../controllers/contributionController');

router.route('/').get(getContributions).post(createContribution);
router.route('/:id').get(getContributionById);

module.exports = router;
