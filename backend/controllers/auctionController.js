const mongoose = require('mongoose');
const Auction = require('../models/Auction');
const Committee = require('../models/Committee');
const Member = require('../models/Member');
const { emitEvent } = require('../socket/socket');

const isDBConnected = () => mongoose.connection.readyState === 1;

// Mask member name for privacy (e.g. "Priya Krishnan" -> "P. Krishnan", or "Member #12")
const maskName = (fullName, memberId, index = 1) => {
  if (!fullName) return `Member #${index < 10 ? '0' + index : index}`;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
};

// Helper to calculate winning bid and winner for an ended auction
const finalizeAuctionWinner = (auction) => {
  if (!auction.bids || auction.bids.length === 0) {
    auction.status = 'Ended';
    auction.winningBid = 0;
    auction.winningDiscount = 0;
    auction.winner = null;
    return auction;
  }

  // Sort bids ascending by amount (Lowest bid wins in reverse auction)
  const sortedBids = [...auction.bids].sort((a, b) => a.amount - b.amount);
  const winningBidObj = sortedBids[0];

  const chitValue = auction.chitValue || auction.poolAmount || 0;
  const winningAmount = winningBidObj.amount;
  const discount = Math.max(0, chitValue - winningAmount);

  auction.status = 'Ended';
  auction.winningBid = winningAmount;
  auction.winningDiscount = discount;
  auction.winner = {
    memberId: winningBidObj.bidderId || '',
    name: winningBidObj.bidderName || '',
    email: winningBidObj.bidderEmail || '',
    maskedName: winningBidObj.maskedName || winningBidObj.bidderName,
  };

  return auction;
};

// @desc    Get all auctions
// @route   GET /api/auctions
const getAuctions = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const { status, committeeId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (committeeId) query.committeeIdStr = committeeId;

    const auctions = await Auction.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: auctions.length,
      data: auctions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single auction by ID
// @route   GET /api/auctions/:id
const getAuctionById = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(53).json({
        success: false,
        message: 'Database not connected.',
      });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      res.status(404);
      throw new Error('Auction not found');
    }

    // Auto-check if timer expired
    if (auction.status === 'Live' && auction.endTime && new Date() >= new Date(auction.endTime)) {
      finalizeAuctionWinner(auction);
      await auction.save();
      emitEvent('auctionEnded', auction);
    }

    res.status(200).json({
      success: true,
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or auto-provision auction for a specific committee
// @route   GET /api/committees/:committeeId/auction
const getCommitteeAuction = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected.',
      });
    }

    const committeeParam = req.params.committeeId;

    let committee = null;
    if (mongoose.Types.ObjectId.isValid(committeeParam)) {
      committee = await Committee.findById(committeeParam);
    }
    if (!committee) {
      committee = await Committee.findOne({ name: { $regex: committeeParam, $options: 'i' } });
    }

    if (!committee) {
      res.status(404);
      throw new Error('Chit Committee not found');
    }

    // Find active, live, or upcoming auction for this committee
    let auction = await Auction.findOne({
      $or: [
        { committee: committee._id },
        { committeeIdStr: committee._id.toString() },
      ],
    }).sort({ createdAt: -1 });

    // Check if current live auction timer expired
    if (auction && auction.status === 'Live' && auction.endTime && new Date() >= new Date(auction.endTime)) {
      finalizeAuctionWinner(auction);
      await auction.save();
      emitEvent('auctionEnded', auction);
    }

    // If no auction exists yet, auto-provision an initial UPCOMING auction bound to committee
    if (!auction) {
      const chitVal = committee.totalChitValue || (committee.monthlyContribution * committee.totalMembers) || 100000;
      auction = await Auction.create({
        committee: committee._id,
        committeeIdStr: committee._id.toString(),
        cycle: 1,
        auctionNumber: 1,
        date: new Date(),
        poolAmount: chitVal,
        chitValue: chitVal,
        startingBid: chitVal,
        currentLowestBid: chitVal,
        status: 'Upcoming',
        durationMinutes: 10,
        bids: [],
      });
    }

    res.status(200).json({
      success: true,
      committee: {
        id: committee._id,
        name: committee.name,
        organizer: committee.organizer,
        organizerEmail: committee.organizerEmail,
        organizerId: committee.organizerId,
        monthlyContribution: committee.monthlyContribution,
        totalChitValue: committee.totalChitValue,
        totalMembers: committee.totalMembers,
        joinedMembers: committee.joinedMembers,
        status: committee.status,
        members: committee.members || [],
      },
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start an auction for a committee (Organizer Only)
// @route   POST /api/auctions/:id/start
const startAuction = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected.',
      });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      res.status(404);
      throw new Error('Auction not found');
    }

    const duration = Number(req.body.durationMinutes) || auction.durationMinutes || 10;
    const now = new Date();
    const end = new Date(now.getTime() + duration * 60 * 1000);

    auction.status = 'Live';
    auction.startTime = now;
    auction.endTime = end;
    auction.durationMinutes = duration;
    if (!auction.currentLowestBid || auction.currentLowestBid === 0) {
      auction.currentLowestBid = auction.chitValue || auction.startingBid || 100000;
    }

    await auction.save();
    emitEvent('auctionStarted', auction);
    emitEvent('auctionUpdated', auction);

    res.status(200).json({
      success: true,
      message: 'Auction started successfully',
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End an auction manually or via timer
// @route   POST /api/auctions/:id/end
const endAuction = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected.',
      });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      res.status(404);
      throw new Error('Auction not found');
    }

    finalizeAuctionWinner(auction);
    await auction.save();

    emitEvent('auctionEnded', auction);
    emitEvent('auctionUpdated', auction);

    res.status(200).json({
      success: true,
      message: 'Auction concluded successfully',
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a reverse bid in a live auction
// @route   POST /api/auctions/:id/bids
const submitBid = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected.',
      });
    }

    const { amount, bidderName, bidderEmail, bidderId } = req.body;
    const requestEmail = (bidderEmail || req.headers['x-user-email'] || '').toLowerCase().trim();
    const requestId = (bidderId || req.headers['x-user-id'] || '').trim();
    const nameStr = (bidderName || req.headers['x-user-name'] || 'Chit Member').trim();

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      res.status(404);
      throw new Error('Auction not found');
    }

    // 1. Check if auction is Live
    if (auction.status !== 'Live') {
      return res.status(400).json({
        success: false,
        message: auction.status === 'Upcoming' ? 'Auction has not started yet.' : 'This auction has ended.',
      });
    }

    // 2. Check if timer expired
    if (auction.endTime && new Date() >= new Date(auction.endTime)) {
      finalizeAuctionWinner(auction);
      await auction.save();
      emitEvent('auctionEnded', auction);
      return res.status(400).json({
        success: false,
        message: 'Auction timer has expired.',
      });
    }

    // 3. Find Committee & validate Organizer & Membership
    let committee = null;
    if (auction.committee) {
      committee = await Committee.findById(auction.committee);
    } else if (auction.committeeIdStr) {
      committee = await Committee.findById(auction.committeeIdStr);
    }

    if (committee) {
      // RULE: ORGANIZER CANNOT PARTICIPATE IN BIDDING
      const isOrganizerByEmail = requestEmail && committee.organizerEmail && requestEmail === committee.organizerEmail.toLowerCase();
      const isOrganizerById = requestId && committee.organizerId && requestId === committee.organizerId;
      const isOrganizerByName = nameStr && committee.organizer && nameStr.toLowerCase() === committee.organizer.toLowerCase();

      if (isOrganizerByEmail || isOrganizerById || isOrganizerByName) {
        return res.status(403).json({
          success: false,
          message: 'Committee organizers cannot participate in their own auction.',
        });
      }

      // RULE: MUST BE A MEMBER OF THIS COMMITTEE
      const isMember = committee.members?.some((m) => {
        if (requestEmail && m.email && m.email.toLowerCase() === requestEmail) return true;
        if (requestId && m.memberId && m.memberId === requestId) return true;
        if (nameStr && m.name && m.name.toLowerCase() === nameStr.toLowerCase()) return true;
        return false;
      });

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'You are not eligible to participate in this auction (must be a committee member).',
        });
      }
    }

    // 4. Validate bid amount logic (REVERSE AUCTION: LOWER IS BETTER)
    const bidVal = Number(amount);
    if (isNaN(bidVal) || bidVal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid bid amount.',
      });
    }

    const currentLowest = auction.currentLowestBid || auction.chitValue || auction.startingBid;

    if (bidVal >= currentLowest) {
      return res.status(400).json({
        success: false,
        message: `Your bid must be lower than the current lowest bid of ₹${currentLowest.toLocaleString('en-IN')}.`,
      });
    }

    // 5. Create Bid subdocument with masked name
    const masked = maskName(nameStr, requestId, (auction.bids ? auction.bids.length : 0) + 1);
    const newBid = {
      bidderId: requestId || requestEmail,
      bidderName: nameStr,
      maskedName: masked,
      bidderEmail: requestEmail,
      amount: bidVal,
      createdAt: new Date(),
    };

    // Atomic update or in-memory push & update
    auction.bids.push(newBid);
    auction.currentLowestBid = bidVal;
    auction.winningBid = bidVal;
    auction.winningDiscount = Math.max(0, (auction.chitValue || 0) - bidVal);

    await auction.save();

    // Broadcast real-time Socket.IO updates
    emitEvent('auctionBidCreated', {
      auctionId: auction._id,
      committeeId: auction.committee || auction.committeeIdStr,
      currentLowestBid: auction.currentLowestBid,
      winningDiscount: auction.winningDiscount,
      bidsCount: auction.bids.length,
      newBid,
      updatedAuction: auction,
    });

    emitEvent('auctionUpdated', auction);

    res.status(200).json({
      success: true,
      message: 'Bid submitted successfully!',
      data: auction,
      newBid,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuctions,
  getAuctionById,
  getCommitteeAuction,
  startAuction,
  endAuction,
  submitBid,
};

