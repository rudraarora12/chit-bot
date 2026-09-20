const mongoose = require('mongoose');
const Contribution = require('../models/Contribution');
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const { emitEvent } = require('../socket/socket');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all contributions
// @route   GET /api/contributions
const getContributions = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        notice: 'Database not connected. Configure MONGO_URI in .env to list contributions.',
      });
    }

    const { memberId, cycle } = req.query;
    let query = {};

    if (memberId) query.member = memberId;
    if (cycle) query.cycle = cycle;

    const contributions = await Contribution.find(query)
      .populate('member', 'name memberId email phone')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: contributions.length,
      data: contributions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contribution by ID
// @route   GET /api/contributions/:id
const getContributionById = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to view contribution details.',
      });
    }

    const contribution = await Contribution.findById(req.params.id).populate(
      'member',
      'name memberId email phone'
    );

    if (!contribution) {
      res.status(404);
      throw new Error('Contribution record not found');
    }

    res.status(200).json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new contribution
// @route   POST /api/contributions
const createContribution = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to create contributions.',
      });
    }

    const { member: memberId, amount, cycle, date, status } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      res.status(404);
      throw new Error('Associated member not found');
    }

    const contribution = await Contribution.create({
      member: memberId,
      amount,
      cycle,
      date: date || Date.now(),
      status: status || 'Completed',
    });

    member.totalContributed = (member.totalContributed || 0) + Number(amount);

    if (member.pendingAmount > 0) {
      member.pendingAmount = Math.max(0, member.pendingAmount - Number(amount));
      if (member.pendingAmount === 0) {
        member.paymentStatus = 'Paid';
      }
    }

    await member.save();

    await Payment.findOneAndUpdate(
      { member: memberId, cycle: cycle, status: { $in: ['Pending', 'Overdue'] } },
      { status: 'Paid', paidDate: new Date(), delayDays: 0 }
    );

    const populatedContribution = await Contribution.findById(contribution._id).populate(
      'member',
      'name memberId email phone'
    );

    emitEvent('contributionCreated', populatedContribution);

    res.status(201).json({
      success: true,
      data: populatedContribution,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContributions,
  getContributionById,
  createContribution,
};
