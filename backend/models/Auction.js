const mongoose = require('mongoose');

const bidSubSchema = new mongoose.Schema({
  bidderId: { type: String },
  bidderName: { type: String, required: true },
  maskedName: { type: String },
  bidderEmail: { type: String },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const auctionSchema = new mongoose.Schema(
  {
    committee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Committee',
    },
    committeeIdStr: {
      type: String,
    },
    cycle: {
      type: Number,
      default: 1,
    },
    auctionNumber: {
      type: mongoose.Schema.Types.Mixed,
      default: 1,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    poolAmount: {
      type: Number,
      default: 0,
    },
    chitValue: {
      type: Number,
      default: 0,
    },
    startingBid: {
      type: Number,
      default: 0,
    },
    currentLowestBid: {
      type: Number,
      default: 0,
    },
    winningBid: {
      type: Number,
      default: 0,
    },
    winningDiscount: {
      type: Number,
      default: 0,
    },
    durationMinutes: {
      type: Number,
      default: 10,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Scheduled', 'Live', 'Ended', 'Completed'],
      default: 'Upcoming',
    },
    winner: {
      memberId: { type: String },
      name: { type: String },
      email: { type: String },
      maskedName: { type: String },
    },
    bids: [bidSubSchema],
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Auction', auctionSchema);

