const mongoose = require('mongoose');
const Member = require('../models/Member');
const Contribution = require('../models/Contribution');
const Payment = require('../models/Payment');
const RiskAlert = require('../models/RiskAlert');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get aggregated dashboard stats from MongoDB
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        data: {
          totalMembers: 0,
          totalContributions: 0,
          pendingPayments: 0,
          pendingAmount: 0,
          riskAlerts: 0,
        },
        notice: 'Database not connected. Configure MONGO_URI in .env to load dynamic stats.',
      });
    }

    const totalMembers = await Member.countDocuments();

    // Aggregate contributions from Contribution collection and Member.totalContributed
    const contributionAggregation = await Contribution.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const memberContributionAgg = await Member.aggregate([
      { $group: { _id: null, total: { $sum: '$totalContributed' } } },
    ]);

    const totalContributions =
      (contributionAggregation[0]?.total || 0) + (memberContributionAgg[0]?.total || 0);

    // Pending payments count
    const paymentPendingCount = await Payment.countDocuments({
      status: { $in: ['Pending', 'Overdue'] },
    });
    const memberPendingCount = await Member.countDocuments({
      paymentStatus: { $in: ['Pending', 'Overdue'] },
    });
    const pendingPaymentsCount = paymentPendingCount || memberPendingCount;

    // Pending amount aggregation
    const pendingAmountAggregation = await Payment.aggregate([
      { $match: { status: { $in: ['Pending', 'Overdue'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const memberPendingAmtAgg = await Member.aggregate([
      { $group: { _id: null, total: { $sum: '$pendingAmount' } } },
    ]);
    const totalPendingAmount =
      (pendingAmountAggregation[0]?.total || 0) + (memberPendingAmtAgg[0]?.total || 0);

    // Risk alerts count
    const riskAlertsDocCount = await RiskAlert.countDocuments({
      resolved: false,
      riskLevel: { $in: ['Medium', 'High'] },
    });
    const memberRiskCount = await Member.countDocuments({
      riskLevel: { $in: ['Medium', 'High'] },
    });
    const riskAlertsCount = riskAlertsDocCount || memberRiskCount;

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        totalContributions,
        pendingPayments: pendingPaymentsCount,
        pendingAmount: totalPendingAmount,
        riskAlerts: riskAlertsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest members for dashboard
// @route   GET /api/dashboard/recent-members
const getRecentMembers = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        notice: 'Database not connected. Configure MONGO_URI in .env to view recent members.',
      });
    }

    const limit = parseInt(req.query.limit, 10) || 5;
    const recentMembers = await Member.find().sort({ createdAt: -1 }).limit(limit);

    res.status(200).json({
      success: true,
      count: recentMembers.length,
      data: recentMembers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment summary statistics
// @route   GET /api/dashboard/payment-summary
const getPaymentSummary = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        data: {
          Paid: { count: 0, totalAmount: 0 },
          Pending: { count: 0, totalAmount: 0 },
          Overdue: { count: 0, totalAmount: 0 },
          Late: { count: 0, totalAmount: 0 },
        },
        notice: 'Database not connected. Configure MONGO_URI in .env to view payment summaries.',
      });
    }

    const summary = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const memberSummary = await Member.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pendingAmount' },
        },
      },
    ]);

    const formattedSummary = {
      Paid: { count: 0, totalAmount: 0 },
      Pending: { count: 0, totalAmount: 0 },
      Overdue: { count: 0, totalAmount: 0 },
      Late: { count: 0, totalAmount: 0 },
    };

    summary.forEach((item) => {
      if (formattedSummary[item._id]) {
        formattedSummary[item._id] = {
          count: item.count,
          totalAmount: item.totalAmount,
        };
      }
    });

    memberSummary.forEach((item) => {
      if (formattedSummary[item._id] && formattedSummary[item._id].count === 0) {
        formattedSummary[item._id] = {
          count: item.count,
          totalAmount: item.totalAmount,
        };
      }
    });

    res.status(200).json({
      success: true,
      data: formattedSummary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRecentMembers,
  getPaymentSummary,
};
