const express = require('express');
const router = express.Router();
const {
  getCommittees,
  getCommitteeById,
  createCommittee,
  joinCommittee,
} = require('../controllers/committeeController');
const {
  getCommitteeAuction,
  startAuction,
  endAuction,
} = require('../controllers/auctionController');

router.route('/')
  .get(getCommittees)
  .post(createCommittee);

router.route('/:id')
  .get(getCommitteeById);

router.route('/:id/join')
  .post(joinCommittee);

router.route('/:committeeId/auction')
  .get(getCommitteeAuction);

router.route('/:committeeId/auction/start')
  .post(startAuction);

router.route('/:committeeId/auction/end')
  .post(endAuction);

module.exports = router;

