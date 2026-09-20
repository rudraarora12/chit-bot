const mongoose = require('mongoose');

const committeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Committee name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    organizer: {
      type: String,
      trim: true,
      default: 'Sharma Organizer',
    },
    organizerId: {
      type: String,
      trim: true,
      default: 'ORG-001',
    },
    organizerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    totalMembers: {
      type: Number,
      required: [true, 'Total members count is required'],
      min: [1, 'Must require at least 1 member'],
    },
    minMembersToStart: {
      type: Number,
      default: 1,
    },
    joinedMembers: {
      type: Number,
      default: 0,
    },
    monthlyContribution: {
      type: Number,
      required: [true, 'Monthly contribution amount is required'],
      min: [0, 'Contribution cannot be negative'],
    },
    totalChitValue: {
      type: Number,
      required: [true, 'Total chit value is required'],
    },
    durationMonths: {
      type: Number,
      required: [true, 'Duration in months is required'],
      min: [1, 'Duration must be at least 1 month'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    joiningDeadline: {
      type: Date,
    },
    auctionFrequency: {
      type: String,
      enum: ['Monthly', 'Bi-weekly', 'Weekly', 'Custom'],
      default: 'Monthly',
    },
    auctionType: {
      type: String,
      default: 'Reverse Auction',
    },
    status: {
      type: String,
      enum: ['Open', 'Full', 'Active', 'Completed'],
      default: 'Open',
    },
    members: [
      {
        memberId: { type: String },
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual field for available slots
committeeSchema.virtual('availableSlots').get(function () {
  return Math.max(0, this.totalMembers - (this.joinedMembers || 0));
});

committeeSchema.set('toJSON', { virtuals: true });
committeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Committee', committeeSchema);
