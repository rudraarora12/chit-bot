const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    organizerId: {
      type: String,
      required: [true, 'Organizer ID is required'],
      trim: true,
    },
    organizerEmail: {
      type: String,
      required: [true, 'Organizer email is required'],
      lowercase: true,
      trim: true,
    },
    organizerName: {
      type: String,
      default: 'Organizer',
      trim: true,
    },
    plan: {
      type: String,
      default: 'organizer',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    price: {
      type: Number,
      default: 499,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
