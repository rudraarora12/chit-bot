const mongoose = require('mongoose');
const Committee = require('../models/Committee');
const Member = require('../models/Member');
const { hasActiveOrganizerSubscription } = require('./subscriptionController');
const { emitEvent } = require('../socket/socket');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all chit committees
// @route   GET /api/committees
const getCommittees = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        notice: 'Database not connected. Configure MONGO_URI in .env to enable MongoDB Atlas persistence.',
      });
    }

    const { search, status, maxContribution, minContribution } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (maxContribution || minContribution) {
      query.monthlyContribution = {};
      if (minContribution) query.monthlyContribution.$gte = Number(minContribution);
      if (maxContribution) query.monthlyContribution.$lte = Number(maxContribution);
    }

    const committees = await Committee.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: committees.length,
      data: committees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single committee by ID
// @route   GET /api/committees/:id
const getCommitteeById = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected.',
      });
    }

    let committee = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      committee = await Committee.findById(req.params.id);
    }

    if (!committee) {
      committee = await Committee.findOne({ name: { $regex: req.params.id, $options: 'i' } });
    }

    if (!committee) {
      res.status(404);
      throw new Error('Chit committee not found');
    }

    res.status(200).json({
      success: true,
      data: committee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new chit committee
// @route   POST /api/committees
const createCommittee = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to save committees.',
      });
    }

    const {
      name,
      description,
      organizer,
      organizerEmail,
      organizerId,
      totalMembers,
      minMembersToStart,
      monthlyContribution,
      totalChitValue,
      durationMonths,
      startDate,
      joiningDeadline,
      auctionFrequency,
      auctionType,
    } = req.body;

    const userEmail = (organizerEmail || req.headers['x-user-email'] || '').toLowerCase().trim();
    const userId = (organizerId || req.headers['x-user-id'] || '').trim();

    // STRICT BUSINESS RULE: Organizer MUST have an active subscription to create a committee
    const isSubscribed = await hasActiveOrganizerSubscription(userId, userEmail);
    if (!isSubscribed) {
      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'An active Organizer subscription is required to create a committee.',
      });
    }

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Committee name is required');
    }

    const parsedTotalMembers = Number(totalMembers);
    if (isNaN(parsedTotalMembers) || parsedTotalMembers <= 0) {
      res.status(400);
      throw new Error('Total members must be a positive number');
    }

    const parsedMonthlyContribution = Number(monthlyContribution);
    if (isNaN(parsedMonthlyContribution) || parsedMonthlyContribution <= 0) {
      res.status(400);
      throw new Error('Monthly contribution must be a positive number');
    }

    const parsedDuration = Number(durationMonths);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      res.status(400);
      throw new Error('Duration in months must be a positive number');
    }

    if (!startDate) {
      res.status(400);
      throw new Error('Start date is required');
    }

    const calculatedChitValue = Number(totalChitValue) || parsedMonthlyContribution * parsedTotalMembers;

    const committee = await Committee.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      organizer: organizer ? organizer.trim() : 'Sharma Organizer',
      organizerEmail: (organizerEmail || req.headers['x-user-email'] || '').toLowerCase().trim(),
      organizerId: organizerId || req.headers['x-user-id'] || 'ORG-001',
      totalMembers: parsedTotalMembers,
      minMembersToStart: Number(minMembersToStart) || 1,
      monthlyContribution: parsedMonthlyContribution,
      totalChitValue: calculatedChitValue,
      durationMonths: parsedDuration,
      startDate: new Date(startDate),
      joiningDeadline: joiningDeadline ? new Date(joiningDeadline) : null,
      auctionFrequency: auctionFrequency || 'Monthly',
      auctionType: auctionType || 'Reverse Auction',
      status: 'Open',
      joinedMembers: 0,
      members: [],
    });

    emitEvent('committeeCreated', committee);

    res.status(201).json({
      success: true,
      message: 'Chit Committee created successfully',
      data: committee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a chit committee
// @route   POST /api/committees/:id/join
const joinCommittee = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to join committee.',
      });
    }

    const { memberId, name, email, phone } = req.body;
    const requestEmail = (email || req.headers['x-user-email'] || '').toLowerCase().trim();
    const requestId = (memberId || req.headers['x-user-id'] || '').trim();

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Member name is required to join committee');
    }

    let committee = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      committee = await Committee.findById(req.params.id);
    }

    if (!committee) {
      committee = await Committee.findOne({ name: { $regex: req.params.id, $options: 'i' } });
    }

    if (!committee) {
      res.status(404);
      throw new Error('Committee not found');
    }

    // 1. RULE: ORGANIZER CANNOT JOIN OWN COMMITTEE
    const isOrganizerByEmail = requestEmail && committee.organizerEmail && requestEmail === committee.organizerEmail.toLowerCase();
    const isOrganizerById = requestId && committee.organizerId && requestId === committee.organizerId;
    const isOrganizerByName = name && committee.organizer && name.toLowerCase().trim() === committee.organizer.toLowerCase().trim() && (requestEmail === committee.organizerEmail || !committee.organizerEmail);

    if (isOrganizerByEmail || isOrganizerById || isOrganizerByName) {
      return res.status(400).json({
        success: false,
        message: 'You cannot join a committee you created.',
      });
    }

    // 2. CHECK STATUS AND DEADLINE
    if (committee.joiningDeadline && new Date() > new Date(committee.joiningDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Joining is currently closed.',
      });
    }

    if (committee.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: 'Joining is currently closed.',
      });
    }

    // 3. CHECK CAPACITY
    const availableSlots = committee.totalMembers - committee.joinedMembers;
    if (availableSlots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This committee is full.',
      });
    }

    // 4. CHECK DUPLICATE JOIN
    const existingMember = committee.members.find((m) => {
      if (requestEmail && m.email && m.email.toLowerCase() === requestEmail) return true;
      if (requestId && m.memberId && m.memberId === requestId) return true;
      return false;
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this committee.',
      });
    }

    const newMemberEntry = {
      memberId: requestId || `CL-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      email: requestEmail,
      phone: phone ? phone.trim() : '',
      joinedAt: new Date(),
    };

    committee.members.push(newMemberEntry);
    committee.joinedMembers = committee.members.length;

    if (committee.joinedMembers >= committee.totalMembers) {
      committee.status = 'Full';
    }

    await committee.save();

    // Optionally sync into Member model
    try {
      const existingDbMember = await Member.findOne({
        $or: [
          { email: newMemberEntry.email },
          { memberId: newMemberEntry.memberId },
        ],
      });

      if (!existingDbMember && newMemberEntry.name) {
        await Member.create({
          name: newMemberEntry.name,
          memberId: newMemberEntry.memberId,
          email: newMemberEntry.email,
          phone: newMemberEntry.phone,
          monthlyContribution: committee.monthlyContribution,
          paymentStatus: 'Pending',
          riskLevel: 'Low',
        });
      }
    } catch (memberSyncErr) {
      console.log('Notice: Member sync error:', memberSyncErr.message);
    }

    emitEvent('committeeMemberJoined', {
      committeeId: committee._id,
      committeeName: committee.name,
      joinedMembers: committee.joinedMembers,
      totalMembers: committee.totalMembers,
      availableSlots: committee.totalMembers - committee.joinedMembers,
      status: committee.status,
      newMember: newMemberEntry,
    });

    emitEvent('committeeUpdated', committee);

    res.status(200).json({
      success: true,
      message: `Successfully joined ${committee.name}`,
      data: committee,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommittees,
  getCommitteeById,
  createCommittee,
  joinCommittee,
};
