const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');

const isDBConnected = () => mongoose.connection.readyState === 1;

/**
 * Reusable helper to check if an organizer has an active subscription in MongoDB Atlas
 */
const hasActiveOrganizerSubscription = async (organizerId, organizerEmail) => {
  if (!isDBConnected()) return true; // Fallback for offline dev mode if DB not connected

  const query = [];
  if (organizerEmail) query.push({ organizerEmail: organizerEmail.toLowerCase().trim() });
  if (organizerId) query.push({ organizerId: organizerId.trim() });

  if (query.length === 0) return false;

  const subscription = await Subscription.findOne({
    $or: query,
    status: 'active',
    endDate: { $gt: new Date() },
  });

  return !!subscription;
};

// @desc    Get current user's subscription status
// @route   GET /api/subscription/me
const getMySubscription = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        data: null,
        notice: 'Database not connected.',
      });
    }

    const email = (req.query.email || req.headers['x-user-email'] || '').toLowerCase().trim();
    const userId = (req.query.userId || req.headers['x-user-id'] || '').trim();

    const query = [];
    if (email) query.push({ organizerEmail: email });
    if (userId) query.push({ organizerId: userId });

    if (query.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    let subscription = await Subscription.findOne({
      $or: query,
    }).sort({ createdAt: -1 });

    // Check if subscription has expired
    if (subscription && subscription.status === 'active' && new Date() > new Date(subscription.endDate)) {
      subscription.status = 'expired';
      await subscription.save();
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate development demo subscription for organizer
// @route   POST /api/subscription/demo-activate
const activateDemoSubscription = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Configure MONGO_URI in .env to activate subscription.',
      });
    }

    const email = (req.body.organizerEmail || req.headers['x-user-email'] || '').toLowerCase().trim();
    const userId = (req.body.organizerId || req.headers['x-user-id'] || 'ORG-001').trim();
    const name = (req.body.organizerName || 'Organizer').trim();

    if (!email && !userId) {
      res.status(400);
      throw new Error('Organizer email or ID is required to activate subscription');
    }

    const startDate = new Date();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days valid

    // Check if subscription already exists for this organizer
    let subscription = await Subscription.findOne({
      $or: [
        { organizerEmail: email },
        { organizerId: userId },
      ],
    });

    if (subscription) {
      subscription.status = 'active';
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.price = 499;
      subscription.currency = 'INR';
      subscription.plan = 'organizer';
      subscription.isDemo = true;
      if (email) subscription.organizerEmail = email;
      if (name) subscription.organizerName = name;
      await subscription.save();
    } else {
      subscription = await Subscription.create({
        organizerId: userId,
        organizerEmail: email || 'organizer@chitledger.com',
        organizerName: name,
        plan: 'organizer',
        status: 'active',
        price: 499,
        currency: 'INR',
        startDate,
        endDate,
        autoRenew: false,
        isDemo: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Demo Organizer Subscription activated successfully for 30 days',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset / expire subscription for testing unsubscribed flow
// @route   POST /api/subscription/demo-reset
const resetDemoSubscription = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected.',
      });
    }

    const email = (req.body.organizerEmail || req.headers['x-user-email'] || '').toLowerCase().trim();
    const userId = (req.body.organizerId || req.headers['x-user-id'] || '').trim();

    const query = [];
    if (email) query.push({ organizerEmail: email });
    if (userId) query.push({ organizerId: userId });

    if (query.length > 0) {
      await Subscription.updateMany(
        { $or: query },
        { $set: { status: 'expired', endDate: new Date(Date.now() - 1000) } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Subscription reset to expired state for demo testing.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  hasActiveOrganizerSubscription,
  getMySubscription,
  activateDemoSubscription,
  resetDemoSubscription,
};
