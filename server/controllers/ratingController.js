const Rating = require('../models/Rating');
const Load = require('../models/Load');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');
const { logActivity } = require('../utils/activityLogger');

// @desc    Create rating
// @route   POST /api/ratings
// @access  Private
exports.createRating = async (req, res) => {
  try {
    const { toUserId, loadId, stars, comment } = req.body;

    // Validate load
    const load = await Load.findById(loadId);

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    if (load.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate after load is completed',
      });
    }

    // Verify user is part of this load
    const isCompany = load.companyId.toString() === req.user._id.toString();
    const lorry = load.assignedLorryId ? await require('../models/Lorry').findById(load.assignedLorryId) : null;
    const isLorryOwner = lorry && lorry.ownerId.toString() === req.user._id.toString();

    if (!isCompany && !isLorryOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this load',
      });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
      fromUserId: req.user._id,
      loadId,
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this load',
      });
    }

    // Create rating
    const rating = await Rating.create({
      fromUserId: req.user._id,
      toUserId,
      loadId,
      stars,
      comment,
    });

    // Notify rated user
    const ratedUser = await User.findById(toUserId);
    await createNotification(
      toUserId,
      'New Rating Received',
      `${req.user.name} gave you ${stars} stars`,
      'Rating',
      'Rating',
      rating._id
    );

    // Log activity
    await logActivity(
      req.user._id,
      'RATING_GIVEN',
      'Rating',
      rating._id,
      `Rated ${ratedUser.name} with ${stars} stars`,
      { ratingId: rating._id, stars, toUserId },
      req
    );

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating,
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating rating',
      error: error.message,
    });
  }
};

// @desc    Get ratings for a user
// @route   GET /api/ratings/user/:userId
// @access  Public
exports.getUserRatings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({
      toUserId: req.params.userId,
      isVisible: true,
    })
      .populate('fromUserId', 'name role')
      .populate('loadId', 'pickupLocation dropLocation')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Rating.countDocuments({
      toUserId: req.params.userId,
      isVisible: true,
    });

    const user = await User.findById(req.params.userId);

    res.status(200).json({
      success: true,
      ratings,
      averageRating: user.ratingAverage,
      totalRatings: user.ratingCount,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
      error: error.message,
    });
  }
};

// @desc    Get my ratings (given by me)
// @route   GET /api/ratings/my-ratings
// @access  Private
exports.getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ fromUserId: req.user._id })
      .populate('toUserId', 'name role')
      .populate('loadId', 'pickupLocation dropLocation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
      error: error.message,
    });
  }
};

// @desc    Check if can rate a load
// @route   GET /api/ratings/can-rate/:loadId
// @access  Private
exports.canRate = async (req, res) => {
  try {
    const load = await Load.findById(req.params.loadId);

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    if (load.status !== 'Completed') {
      return res.status(200).json({
        success: true,
        canRate: false,
        reason: 'Load not completed yet',
      });
    }

    const existingRating = await Rating.findOne({
      fromUserId: req.user._id,
      loadId: req.params.loadId,
    });

    if (existingRating) {
      return res.status(200).json({
        success: true,
        canRate: false,
        reason: 'Already rated',
      });
    }

    // Determine who to rate
    let targetUserId = null;
    if (load.companyId.toString() === req.user._id.toString()) {
      // Company rating lorry owner
      const lorry = await require('../models/Lorry').findById(load.assignedLorryId);
      targetUserId = lorry ? lorry.ownerId : null;
    } else {
      // Lorry owner rating company
      targetUserId = load.companyId;
    }

    res.status(200).json({
      success: true,
      canRate: true,
      targetUserId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking rating eligibility',
      error: error.message,
    });
  }
};
