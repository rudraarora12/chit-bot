const mongoose = require('mongoose');
const Member = require('../models/Member');
const { emitEvent } = require('../socket/socket');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all members with optional filters (search, paymentStatus, riskLevel)
// @route   GET /api/members
const getMembers = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        notice: 'Database not connected. Configure MONGO_URI in .env to enable MongoDB Atlas persistence.',
      });
    }

    const { search, paymentStatus, riskLevel } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    const members = await Member.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get member by ID
// @route   GET /api/members/:id
const getMemberById = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to perform database operations.',
      });
    }

    let member;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      member = await Member.findById(req.params.id);
    }
    if (!member) {
      member = await Member.findOne({ memberId: req.params.id });
    }

    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new member
// @route   POST /api/members
const createMember = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to save members.',
      });
    }

    const member = await Member.create(req.body);

    emitEvent('memberCreated', member);

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
const updateMember = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to update members.',
      });
    }

    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    emitEvent('memberUpdated', member);

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
const deleteMember = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to delete members.',
      });
    }

    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    emitEvent('memberDeleted', { id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
