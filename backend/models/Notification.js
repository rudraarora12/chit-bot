const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['payment', 'auction', 'risk', 'system'],
      default: 'system',
    },
    read: {
      type: Boolean,
      default: false,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
