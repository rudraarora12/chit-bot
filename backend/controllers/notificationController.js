const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { emitEvent } = require('../socket/socket');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get notifications
// @route   GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        notice: 'Database not connected. Configure MONGO_URI in .env to view notifications.',
      });
    }

    const { read, type } = req.query;
    let query = {};

    if (read !== undefined) query.read = read === 'true';
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .populate('member', 'name memberId')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification
// @route   POST /api/notifications
const createNotification = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to create notifications.',
      });
    }

    const notification = await Notification.create(req.body);

    const populatedNotification = await Notification.findById(notification._id).populate(
      'member',
      'name memberId'
    );

    emitEvent('notificationCreated', populatedNotification);

    res.status(201).json({
      success: true,
      data: populatedNotification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to update notification status.',
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
};
