const mongoose = require('mongoose');
const Auction = require('../models/Auction');
const Member = require('../models/Member');
const { emitEvent } = require('../socket/socket');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all auctions
// @route   GET /api/auctions
const getAuctions = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        notice: 'Database not connected. Configure MONGO_URI in .env to list auctions.',
      });
    }

    const { status } = req.query;
    let query = {};

    if (status) query.status = status;

    const auctions = await Auction.find(query)
      .populate('winner', 'name memberId email phone')
      .populate('participants', 'name memberId')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: auctions.length,
      data: auctions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get auction by ID
// @route   GET /api/auctions/:id
const getAuctionById = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to view auction details.',
      });
    }

    const auction = await Auction.findById(req.params.id)
      .populate('winner', 'name memberId email phone')
      .populate('participants', 'name memberId phone');

    if (!auction) {
      res.status(404);
      throw new Error('Auction not found');
    }

    res.status(200).json({
      success: true,
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new auction
// @route   POST /api/auctions
const createAuction = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to schedule auctions.',
      });
    }

    const auction = await Auction.create(req.body);

    const populatedAuction = await Auction.findById(auction._id)
      .populate('winner', 'name memberId email phone')
      .populate('participants', 'name memberId');

    emitEvent('auctionCreated', populatedAuction);

    res.status(201).json({
      success: true,
      data: populatedAuction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update auction
// @route   PUT /api/auctions/:id
const updateAuction = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to update auctions.',
      });
    }

    const existingAuction = await Auction.findById(req.params.id);
    if (!existingAuction) {
      res.status(404);
      throw new Error('Auction not found');
    }

    const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('winner', 'name memberId email phone')
      .populate('participants', 'name memberId');

    if (
      auction.winner &&
      (!existingAuction.winner ||
        existingAuction.winner.toString() !== auction.winner._id.toString())
    ) {
      await Member.findByIdAndUpdate(auction.winner._id, {
        $inc: { auctionCount: 1 },
      });
    }

    emitEvent('auctionUpdated', auction);

    res.status(200).json({
      success: true,
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
};
