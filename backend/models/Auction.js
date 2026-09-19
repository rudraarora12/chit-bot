const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    auctionNumber: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Auction number is required'],
    },
    date: {
      type: Date,
      required: [true, 'Auction date is required'],
    },
    poolAmount: {
      type: Number,
      required: [true, 'Pool amount is required'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Live', 'Completed'],
      default: 'Scheduled',
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    winningBid: {
      type: Number,
      default: 0,
    },
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
