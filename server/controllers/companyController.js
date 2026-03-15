const CompanyProfile = require('../models/CompanyProfile');
const Load = require('../models/Load');
const Transaction = require('../models/Transaction');
const { logActivity } = require('../utils/activityLogger');

// @desc    Update company profile
// @route   PUT /api/company/profile
// @access  Private (Company only)
exports.updateCompanyProfile = async (req, res) => {
  try {
    const { companyName, goodsType, address, bankDetails } = req.body;

    let profile = await CompanyProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found',
      });
    }

    profile = await CompanyProfile.findOneAndUpdate(
      { userId: req.user._id },
      { companyName, goodsType, address, bankDetails },
      { new: true, runValidators: true }
    );

    // Log activity
    await logActivity(
      req.user._id,
      'PROFILE_UPDATED',
      'CompanyProfile',
      profile._id,
      'Company profile updated',
      { companyName },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Company profile updated successfully',
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating company profile',
      error: error.message,
    });
  }
};

// @desc    Get company profile
// @route   GET /api/company/profile
// @access  Private (Company only)
exports.getCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found',
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching company profile',
      error: error.message,
    });
  }
};

// @desc    Get company dashboard stats
// @route   GET /api/company/stats
// @access  Private (Company only)
exports.getCompanyStats = async (req, res) => {
  try {
    const totalLoads = await Load.countDocuments({ companyId: req.user._id });
    const activeLoads = await Load.countDocuments({
      companyId: req.user._id,
      status: { $in: ['Accepted', 'Reached Pickup', 'On Route', 'Delivered'] },
    });
    const completedLoads = await Load.countDocuments({
      companyId: req.user._id,
      status: 'Completed',
    });
    const pendingLoads = await Load.countDocuments({
      companyId: req.user._id,
      status: 'Posted',
    });

    const transactions = await Transaction.find({ companyId: req.user._id, status: 'Verified' });
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    const recentLoads = await Load.find({ companyId: req.user._id })
      .populate('assignedLorryId')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalLoads,
        activeLoads,
        completedLoads,
        pendingLoads,
        totalSpent,
        recentLoads,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message,
    });
  }
};
