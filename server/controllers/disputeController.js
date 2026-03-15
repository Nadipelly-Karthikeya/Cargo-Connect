const Dispute = require('../models/Dispute');
const Load = require('../models/Load');
const { uploadToCloudinary } = require('../config/cloudinary');
const { createNotification } = require('../utils/notificationHelper');
const { logActivity } = require('../utils/activityLogger');
const fs = require('fs');

// @desc    Create dispute
// @route   POST /api/disputes
// @access  Private
exports.createDispute = async (req, res) => {
  try {
    const { loadId, againstUser, title, description, category, priority } = req.body;

    // Validate load
    const load = await Load.findById(loadId);

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    // Verify user is part of this load
    const isCompany = load.companyId.toString() === req.user._id.toString();
    const lorry = load.assignedLorryId ? await require('../models/Lorry').findById(load.assignedLorryId) : null;
    const isLorryOwner = lorry && lorry.ownerId.toString() === req.user._id.toString();

    if (!isCompany && !isLorryOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create dispute for this load',
      });
    }

    // Check for existing open dispute
    const existingDispute = await Dispute.findOne({
      loadId,
      raisedBy: req.user._id,
      status: { $in: ['Open', 'Under Review'] },
    });

    if (existingDispute) {
      return res.status(400).json({
        success: false,
        message: 'You already have an open dispute for this load',
      });
    }

    // Handle evidence files
    let evidenceUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'dispute-evidence');
        evidenceUrls.push(url);
      }
    }

    // Create dispute
    const dispute = await Dispute.create({
      loadId,
      raisedBy: req.user._id,
      againstUser,
      title,
      description,
      category,
      priority: priority || 'Medium',
      evidenceUrls,
    });

    // Notify the other party
    await createNotification(
      againstUser,
      'Dispute Raised',
      `A dispute has been raised against you for load #${loadId}`,
      'Dispute',
      'Dispute',
      dispute._id
    );

    // Notify admins
    const admins = await require('../models/User').find({ role: 'admin' });
    const adminIds = admins.map(a => a._id);
    await require('../utils/notificationHelper').createBulkNotifications(
      adminIds,
      'New Dispute',
      `New dispute raised: ${title}`,
      'Dispute'
    );

    // Log activity
    await logActivity(
      req.user._id,
      'DISPUTE_RAISED',
      'Dispute',
      dispute._id,
      `Raised dispute: ${title}`,
      { disputeId: dispute._id, loadId, category },
      req
    );

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully. Admin will review it soon.',
      dispute,
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating dispute',
      error: error.message,
    });
  }
};

// @desc    Get my disputes
// @route   GET /api/disputes/my-disputes
// @access  Private
exports.getMyDisputes = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { raisedBy: req.user._id },
        { againstUser: req.user._id },
      ],
    };

    if (status) query.status = status;

    const disputes = await Dispute.find(query)
      .populate('loadId', 'pickupLocation dropLocation status')
      .populate('raisedBy', 'name role')
      .populate('againstUser', 'name role')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Dispute.countDocuments(query);

    res.status(200).json({
      success: true,
      disputes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching disputes',
      error: error.message,
    });
  }
};

// @desc    Get all disputes (Admin)
// @route   GET /api/disputes/all
// @access  Private (Admin only)
exports.getAllDisputes = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const disputes = await Dispute.find(query)
      .populate('loadId', 'pickupLocation dropLocation status')
      .populate('raisedBy', 'name role email')
      .populate('againstUser', 'name role email')
      .populate('resolvedBy', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Dispute.countDocuments(query);

    res.status(200).json({
      success: true,
      disputes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching disputes',
      error: error.message,
    });
  }
};

// @desc    Resolve dispute (Admin)
// @route   PUT /api/disputes/:id/resolve
// @access  Private (Admin only)
exports.resolveDispute = async (req, res) => {
  try {
    const { resolution, status } = req.body;

    const dispute = await Dispute.findById(req.params.id)
      .populate('raisedBy')
      .populate('againstUser');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    if (dispute.status === 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Dispute already resolved',
      });
    }

    dispute.status = status || 'Resolved';
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user._id;
    dispute.resolutionDate = new Date();
    await dispute.save();

    // Notify both parties
    await createNotification(
      dispute.raisedBy._id,
      'Dispute Resolved',
      `Your dispute has been ${status === 'Resolved' ? 'resolved' : 'rejected'}`,
      'Dispute',
      'Dispute',
      dispute._id
    );

    await createNotification(
      dispute.againstUser._id,
      'Dispute Resolved',
      `A dispute against you has been ${status === 'Resolved' ? 'resolved' : 'rejected'}`,
      'Dispute',
      'Dispute',
      dispute._id
    );

    // Log activity
    await logActivity(
      req.user._id,
      'DISPUTE_RESOLVED',
      'Dispute',
      dispute._id,
      `Resolved dispute: ${dispute.title}`,
      { disputeId: dispute._id, status },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully',
      dispute,
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving dispute',
      error: error.message,
    });
  }
};

// @desc    Get dispute by ID
// @route   GET /api/disputes/:id
// @access  Private
exports.getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('loadId')
      .populate('raisedBy', 'name role email phone')
      .populate('againstUser', 'name role email phone')
      .populate('resolvedBy', 'name');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    // Check authorization
    const isInvolved =
      dispute.raisedBy._id.toString() === req.user._id.toString() ||
      dispute.againstUser._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isInvolved) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this dispute',
      });
    }

    res.status(200).json({
      success: true,
      dispute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dispute',
      error: error.message,
    });
  }
};
