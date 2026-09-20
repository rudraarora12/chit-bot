const mongoose = require('mongoose');
const RiskAlert = require('../models/RiskAlert');
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const { emitEvent } = require('../socket/socket');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all risk alerts
// @route   GET /api/risk
const getRiskAlerts = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        notice: 'Database not connected. Configure MONGO_URI in .env to list risk alerts.',
      });
    }

    const { riskLevel, resolved } = req.query;
    let query = {};

    if (riskLevel) query.riskLevel = riskLevel;
    if (resolved !== undefined) query.resolved = resolved === 'true';

    const alerts = await RiskAlert.find(query)
      .populate('member', 'name memberId email phone paymentStatus pendingAmount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get risk alert history for a specific member
// @route   GET /api/risk/:memberId
const getRiskByMemberId = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to fetch risk data.',
      });
    }

    const memberId = req.params.memberId;

    let member = await Member.findById(memberId).catch(() => null);
    if (!member) {
      member = await Member.findOne({ memberId });
    }

    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    const alerts = await RiskAlert.find({ member: member._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      member: {
        id: member._id,
        memberId: member.memberId,
        name: member.name,
        riskLevel: member.riskLevel,
        riskScore: member.riskScore,
      },
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Perform deterministic early-risk analysis on member payment behaviour
// @route   POST /api/risk/analyze/:memberId
const analyzeMemberRisk = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to run risk analysis.',
      });
    }

    const targetId = req.params.memberId;

    let member = await Member.findById(targetId).catch(() => null);
    if (!member) {
      member = await Member.findOne({ memberId: targetId });
    }

    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    const payments = await Payment.find({ member: member._id });

    let riskScore = 0;
    const reasons = [];

    const missedPayments = payments.filter(
      (p) => p.status === 'Overdue' || p.status === 'Pending'
    );
    const latePayments = payments.filter((p) => p.status === 'Late');
    const totalDelays = payments.reduce((acc, p) => acc + (p.delayDays || 0), 0);

    if (missedPayments.length > 0) {
      const penalty = Math.min(50, missedPayments.length * 25);
      riskScore += penalty;
      reasons.push(
        `Member has ${missedPayments.length} pending/overdue payment cycle(s) (+${penalty} pts)`
      );
    }

    if (latePayments.length > 0) {
      const penalty = Math.min(30, latePayments.length * 15);
      riskScore += penalty;
      reasons.push(
        `Member has ${latePayments.length} historical late payment cycle(s) (+${penalty} pts)`
      );
    }

    if (totalDelays > 0) {
      const penalty = Math.min(25, Math.floor(totalDelays * 2));
      riskScore += penalty;
      reasons.push(
        `Accumulated payment delay of ${totalDelays} total day(s) (+${penalty} pts)`
      );
    }

    if (member.pendingAmount > 0 && member.monthlyContribution > 0) {
      const pendingRatio = member.pendingAmount / member.monthlyContribution;
      if (pendingRatio >= 2) {
        riskScore += 20;
        reasons.push(
          `Pending balance exceeds ${pendingRatio.toFixed(1)}x monthly contribution quota (+20 pts)`
        );
      }
    }

    riskScore = Math.min(100, Math.max(0, riskScore));

    let riskLevel = 'Low';
    if (riskScore > 60) {
      riskLevel = 'High';
    } else if (riskScore > 30) {
      riskLevel = 'Medium';
    }

    if (reasons.length === 0) {
      reasons.push('Member maintains a clean payment record with zero observed delays.');
    }

    member.riskScore = riskScore;
    member.riskLevel = riskLevel;
    await member.save();

    const riskAlert = await RiskAlert.create({
      member: member._id,
      riskLevel,
      riskScore,
      reasons,
      resolved: riskLevel === 'Low',
    });

    const populatedAlert = await RiskAlert.findById(riskAlert._id).populate(
      'member',
      'name memberId email phone paymentStatus pendingAmount'
    );

    emitEvent('riskUpdated', populatedAlert);

    res.status(200).json({
      success: true,
      message: 'Early-risk evaluation calculated successfully',
      data: {
        memberId: member.memberId,
        memberName: member.name,
        riskLevel,
        riskScore,
        reasons,
        evaluatedAt: riskAlert.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRiskAlerts,
  getRiskByMemberId,
  analyzeMemberRisk,
};
