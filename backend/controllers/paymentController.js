const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const { emitEvent } = require('../socket/socket');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all payments
// @route   GET /api/payments
const getPayments = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        notice: 'Database not connected. Configure MONGO_URI in .env to list payments.',
      });
    }

    const { status, memberId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (memberId) query.member = memberId;

    const payments = await Payment.find(query)
      .populate('member', 'name memberId email phone paymentStatus')
      .sort({ dueDate: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
const getPaymentById = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to view payment details.',
      });
    }

    const payment = await Payment.findById(req.params.id).populate(
      'member',
      'name memberId email phone paymentStatus'
    );

    if (!payment) {
      res.status(404);
      throw new Error('Payment record not found');
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new payment record
// @route   POST /api/payments
const createPayment = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to create payments.',
      });
    }

    const { member: memberId, amount, dueDate, status, cycle, delayDays } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      res.status(404);
      throw new Error('Associated member not found');
    }

    const payment = await Payment.create({
      member: memberId,
      amount,
      dueDate,
      status: status || 'Pending',
      cycle,
      delayDays: delayDays || 0,
    });

    if (payment.status === 'Pending' || payment.status === 'Overdue') {
      member.pendingAmount = (member.pendingAmount || 0) + Number(amount);
      if (payment.status === 'Overdue') {
        member.paymentStatus = 'Overdue';
      }
      await member.save();
    }

    const populatedPayment = await Payment.findById(payment._id).populate(
      'member',
      'name memberId email phone paymentStatus'
    );

    emitEvent('paymentUpdated', populatedPayment);

    res.status(201).json({
      success: true,
      data: populatedPayment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status/details
// @route   PUT /api/payments/:id
const updatePayment = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to update payments.',
      });
    }

    const existingPayment = await Payment.findById(req.params.id);
    if (!existingPayment) {
      res.status(404);
      throw new Error('Payment record not found');
    }

    const previousStatus = existingPayment.status;
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('member', 'name memberId email phone paymentStatus pendingAmount');

    if (payment.member && previousStatus !== payment.status) {
      const member = await Member.findById(payment.member._id || payment.member);

      if (member) {
        if (payment.status === 'Paid' && previousStatus !== 'Paid') {
          member.pendingAmount = Math.max(0, (member.pendingAmount || 0) - payment.amount);
          member.totalContributed = (member.totalContributed || 0) + payment.amount;

          const remainingPending = await Payment.countDocuments({
            member: member._id,
            _id: { $ne: payment._id },
            status: { $in: ['Pending', 'Overdue'] },
          });

          if (remainingPending === 0) {
            member.paymentStatus = 'Paid';
          }
        } else if (payment.status === 'Overdue') {
          member.paymentStatus = 'Overdue';
        }

        await member.save();
      }
    }

    emitEvent('paymentUpdated', payment);

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
};
