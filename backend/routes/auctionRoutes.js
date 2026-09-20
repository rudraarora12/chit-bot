const express = require('express');
const router = express.Router();
const {
  getAuctions,
  getAuctionById,
  getCommitteeAuction,
  startAuction,
  endAuction,
  submitBid,
} = require('../controllers/auctionController');

router.route('/').get(getAuctions);
router.route('/:id').get(getAuctionById);
router.route('/:id/start').post(startAuction);
router.route('/:id/end').post(endAuction);
router.route('/:id/bids').post(submitBid);

module.exports = router;

