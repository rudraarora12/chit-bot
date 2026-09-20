const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue', 'Late'],
      default: 'Pending',
    },
    delayDays: {
      type: Number,
      default: 0,
    },
    cycle: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Payment cycle is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
