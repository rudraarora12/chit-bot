const express = require('express');
const router = express.Router();
const {
  getAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
} = require('../controllers/auctionController');

router.route('/').get(getAuctions).post(createAuction);
router.route('/:id').get(getAuctionById).put(updateAuction);

module.exports = router;
