const User = require('../models/User');
const Load = require('../models/Load');
const Lorry = require('../models/Lorry');
const Transaction = require('../models/Transaction');
const Rating = require('../models/Rating');
const Dispute = require('../models/Dispute');
const { sendPaymentVerificationEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationHelper');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isVerified, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// @desc    Suspend/activate user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
exports.toggleUserSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend admin users',
      });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    // Notify user
    await createNotification(
      user._id,
      user.isSuspended ? 'Account Suspended' : 'Account Activated',
      user.isSuspended
        ? 'Your account has been suspended. Contact support for details.'
        : 'Your account has been activated.',
      'System',
      'User',
      user._id
    );

    // Log activity
    await logActivity(
      req.user._id,
      user.isSuspended ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      'User',
      user._id,
      `User ${user.isSuspended ? 'suspended' : 'activated'}: ${user.email}`,
      { userId: user._id, email: user.email },
      req
    );

    res.status(200).json({
      success: true,
      message: `User ${user.isSuspended ? 'suspended' : 'activated'} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message,
    });
  }
};

// @desc    Get all loads
// @route   GET /api/admin/loads
// @access  Private (Admin only)
exports.getAllLoads = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const loads = await Load.find(query)
      .populate('companyId', 'name email phone')
      .populate('assignedLorryId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Load.countDocuments(query);

    res.status(200).json({
      success: true,
      loads,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching loads',
      error: error.message,
    });
  }
};

// @desc    Approve/reject load
// @route   PUT /api/admin/loads/:id/approve
// @access  Private (Admin only)
exports.approveLoad = async (req, res) => {
  try {
    const { approved, rejectionReason } = req.body;
    const load = await Load.findById(req.params.id).populate('companyId');

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    if (load.paymentStatus !== 'Screenshot Uploaded') {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot not uploaded yet',
      });
    }

    if (approved) {
      load.isAdminApproved = true;
      load.status = 'Approved';
      load.paymentStatus = 'Verified';
    } else {
      load.status = 'Cancelled';
      load.rejectionReason = rejectionReason;
      load.paymentStatus = 'Failed';
    }

    await load.save();

    // Update transaction
    await Transaction.findOneAndUpdate(
      { loadId: load._id },
      {
        status: approved ? 'Verified' : 'Rejected',
        verifiedByAdmin: req.user._id,
        verificationDate: new Date(),
        rejectionReason: approved ? undefined : rejectionReason,
      }
    );

    // Notify company
    await createNotification(
      load.companyId._id,
      approved ? 'Load Approved' : 'Load Rejected',
      approved
        ? `Your load #${load._id} has been approved`
        : `Your load #${load._id} was rejected: ${rejectionReason}`,
      'Load',
      'Load',
      load._id
    );

    // Send email
    try {
      await sendPaymentVerificationEmail(
        load.companyId.email,
        load.companyId.name,
        load._id,
        approved ? 'Verified' : 'Rejected'
      );
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    // Log activity
    await logActivity(
      req.user._id,
      approved ? 'LOAD_APPROVED' : 'LOAD_REJECTED',
      'Load',
      load._id,
      `Load ${approved ? 'approved' : 'rejected'}`,
      { loadId: load._id, approved, rejectionReason },
      req
    );

    res.status(200).json({
      success: true,
      message: `Load ${approved ? 'approved' : 'rejected'} successfully`,
      load,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating load',
      error: error.message,
    });
  }
};

// @desc    Get all lorries
// @route   GET /api/admin/lorries
// @access  Private (Admin only)
exports.getAllLorries = async (req, res) => {
  try {
    const { isVerified, page = 1, limit = 20 } = req.query;

    const query = {};
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const lorries = await Lorry.find(query)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Lorry.countDocuments(query);

    res.status(200).json({
      success: true,
      lorries,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lorries',
      error: error.message,
    });
  }
};

// @desc    Verify/reject lorry
// @route   PUT /api/admin/lorries/:id/verify
// @access  Private (Admin only)
exports.verifyLorry = async (req, res) => {
  try {
    const { verified } = req.body;
    const lorry = await Lorry.findById(req.params.id).populate('ownerId');

    if (!lorry) {
      return res.status(404).json({ success: false, message: 'Lorry not found' });
    }

    lorry.isVerified = verified;
    await lorry.save();

    // Notify owner
    await createNotification(
      lorry.ownerId._id,
      verified ? 'Vehicle Verified' : 'Vehicle Rejected',
      `Your vehicle ${lorry.vehicleNumber} has been ${verified ? 'verified' : 'rejected'}`,
      'System',
      'Lorry',
      lorry._id
    );

    // Log activity
    await logActivity(
      req.user._id,
      verified ? 'LORRY_VERIFIED' : 'LORRY_REJECTED',
      'Lorry',
      lorry._id,
      `Lorry ${verified ? 'verified' : 'rejected'}: ${lorry.vehicleNumber}`,
      { lorryId: lorry._id, vehicleNumber: lorry.vehicleNumber },
      req
    );

    res.status(200).json({
      success: true,
      message: `Lorry ${verified ? 'verified' : 'rejected'} successfully`,
      lorry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying lorry',
      error: error.message,
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin only)
exports.getAllTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('loadId')
      .populate('companyId', 'name email')
      .populate('lorryOwnerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message,
    });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCompanies = await User.countDocuments({ role: 'company' });
    const totalLorryOwners = await User.countDocuments({ role: 'lorry' });
    const totalLoads = await Load.countDocuments();
    const activeLoads = await Load.countDocuments({
      status: { $in: ['Accepted', 'Reached Pickup', 'On Route', 'Delivered'] },
    });
    const completedLoads = await Load.countDocuments({ status: 'Completed' });
    const totalLorries = await Lorry.countDocuments();
    const verifiedLorries = await Lorry.countDocuments({ isVerified: true });

    const verifiedTransactions = await Transaction.find({ status: 'Verified' });
    const totalRevenue = verifiedTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Top rated users
    const topRatedUsers = await User.find({ ratingAverage: { $gt: 0 } })
      .sort({ ratingAverage: -1, ratingCount: -1 })
      .limit(10)
      .select('name role ratingAverage ratingCount');

    // Recent loads
    const recentLoads = await Load.find()
      .populate('companyId', 'name')
      .populate('assignedLorryId')
      .sort({ createdAt: -1 })
      .limit(10);

    // Loads per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const loadsPerDay = await Load.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          companies: totalCompanies,
          lorryOwners: totalLorryOwners,
        },
        loads: {
          total: totalLoads,
          active: activeLoads,
          completed: completedLoads,
        },
        lorries: {
          total: totalLorries,
          verified: verifiedLorries,
        },
        revenue: {
          total: totalRevenue,
        },
        topRatedUsers,
        recentLoads,
        loadsPerDay,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};

// @desc    Remove rating
// @route   DELETE /api/admin/ratings/:id
// @access  Private (Admin only)
exports.removeRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    rating.isVisible = false;
    await rating.save();

    // Log activity
    await logActivity(
      req.user._id,
      'RATING_REMOVED',
      'Rating',
      rating._id,
      'Admin removed rating',
      { ratingId: rating._id },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Rating hidden successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing rating',
      error: error.message,
    });
  }
};
