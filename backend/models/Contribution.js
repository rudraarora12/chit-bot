const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Contribution amount is required'],
    },
    cycle: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Contribution cycle is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contribution', contributionSchema);
