const Load = require('../models/Load');
const Lorry = require('../models/Lorry');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');
const { calculateEstimatedCost, estimateDeliveryTime, generateDeliveryOTP } = require('../utils/costCalculator');
const { sendLoadStatusEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationHelper');
const { logActivity } = require('../utils/activityLogger');
const { generateLoadInvoice } = require('../utils/pdfGenerator');
const fs = require('fs');

// @desc    Create new load
// @route   POST /api/loads
// @access  Private (Company only)
exports.createLoad = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropLocation,
      goodsType,
      weight,
      requiredVehicleType,
      distance,
      specialInstructions,
    } = req.body;

    // Calculate estimated cost
    const estimatedCost = calculateEstimatedCost(distance, requiredVehicleType, weight);
    const estimatedDeliveryTime = estimateDeliveryTime(distance);

    // Create load
    const load = await Load.create({
      companyId: req.user._id,
      pickupLocation,
      dropLocation,
      goodsType,
      weight,
      requiredVehicleType,
      distance,
      estimatedCost,
      estimatedDeliveryTime,
      specialInstructions,
      status: 'Posted',
    });

    // Log activity
    await logActivity(
      req.user._id,
      'LOAD_CREATED',
      'Load',
      load._id,
      `Created new load from ${pickupLocation.city} to ${dropLocation.city}`,
      { loadId: load._id, estimatedCost },
      req
    );

    res.status(201).json({
      success: true,
      message: 'Load created successfully. Please upload payment screenshot for admin approval.',
      load,
    });
  } catch (error) {
    console.error('Create load error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating load',
      error: error.message,
    });
  }
};

// @desc    Upload payment screenshot
// @route   POST /api/loads/:id/payment
// @access  Private (Company only)
exports.uploadPaymentScreenshot = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id);

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    if (load.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.path, 'payments');

    // Update load
    load.paymentScreenshotUrl = imageUrl;
    load.paymentStatus = 'Screenshot Uploaded';
    await load.save();

    // Create transaction record
    await Transaction.create({
      loadId: load._id,
      companyId: req.user._id,
      amount: load.estimatedCost,
      screenshotUrl: imageUrl,
      status: 'Pending',
    });

    // Log activity
    await logActivity(
      req.user._id,
      'PAYMENT_UPLOADED',
      'Load',
      load._id,
      'Payment screenshot uploaded',
      { loadId: load._id },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Payment screenshot uploaded. Waiting for admin verification.',
      load,
    });
  } catch (error) {
    console.error('Upload payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading payment',
      error: error.message,
    });
  }
};

// @desc    Get all available loads (for lorry owners)
// @route   GET /api/loads/available
// @access  Private (Lorry owner only)
exports.getAvailableLoads = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      goodsType, 
      vehicleType, 
      minCost, 
      maxCost,
      search,
      pickupCity,
      dropCity,
      userLat,
      userLng
    } = req.query;

    // Show loads immediately after posting (more permissive for better UX)
    const query = {
      assignedLorryId: null,
      status: { $in: ['Posted', 'Approved'] }, // Show loads that are posted or approved
    };

    // Search filters
    if (goodsType) query.goodsType = goodsType;
    if (vehicleType) query.requiredVehicleType = vehicleType;
    if (pickupCity) query['pickupLocation.city'] = new RegExp(pickupCity, 'i');
    if (dropCity) query['dropLocation.city'] = new RegExp(dropCity, 'i');
    
    if (minCost || maxCost) {
      query.estimatedCost = {};
      if (minCost) query.estimatedCost.$gte = Number(minCost);
      if (maxCost) query.estimatedCost.$lte = Number(maxCost);
    }

    // Text search across multiple fields
    if (search) {
      query.$or = [
        { goodsType: new RegExp(search, 'i') },
        { 'pickupLocation.city': new RegExp(search, 'i') },
        { 'pickupLocation.state': new RegExp(search, 'i') },
        { 'dropLocation.city': new RegExp(search, 'i') },
        { 'dropLocation.state': new RegExp(search, 'i') },
      ];
    }

    // Debug logging
    console.log('=== GET AVAILABLE LOADS DEBUG ===');
    console.log('Query:', JSON.stringify(query, null, 2));

    let loads = await Load.find(query)
      .populate('companyId', 'name phone email ratingAverage ratingCount isVerified')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    console.log('Loads found:', loads.length);
    if (loads.length > 0) {
      console.log('First load sample:', {
        id: loads[0]._id,
        status: loads[0].status,
        assignedLorryId: loads[0].assignedLorryId,
        goodsType: loads[0].goodsType
      });
    }
    console.log('================================');

    // Location-based sorting: "Available Loads Near You"
    if (userLat && userLng) {
      const lat = parseFloat(userLat);
      const lng = parseFloat(userLng);
      
      // Calculate distance for each load
      loads = loads.map(load => {
        const pickupLat = load.pickupLocation.coordinates?.lat;
        const pickupLng = load.pickupLocation.coordinates?.lng;
        
        if (pickupLat && pickupLng) {
          // Haversine formula for distance calculation
          const R = 6371; // Earth's radius in km
          const dLat = (pickupLat - lat) * Math.PI / 180;
          const dLng = (pickupLng - lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(pickupLat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          
          return { ...load, distanceFromUser: Math.round(distance) };
        }
        
        return { ...load, distanceFromUser: null };
      });
      
      // Sort by nearest first
      loads.sort((a, b) => {
        if (a.distanceFromUser === null) return 1;
        if (b.distanceFromUser === null) return -1;
        return a.distanceFromUser - b.distanceFromUser;
      });
    } else {
      // Default: sort by newest first
      loads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const count = await Load.countDocuments(query);

    res.status(200).json({
      success: true,
      loads,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Get available loads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available loads',
      error: error.message,
    });
  }
};

// @desc    Accept load
// @route   POST /api/loads/:id/accept
// @access  Private (Lorry owner only)
exports.acceptLoad = async (req, res) => {
  try {
    const { lorryId } = req.body;

    const load = await Load.findById(req.params.id);

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    // Allow accepting loads that are Posted or Approved (not yet assigned)
    if (!['Posted', 'Approved'].includes(load.status) || load.assignedLorryId) {
      return res.status(400).json({
        success: false,
        message: 'This load is not available',
      });
    }

    // Verify lorry ownership
    const lorry = await Lorry.findById(lorryId);

    if (!lorry || lorry.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Invalid lorry or not authorized',
      });
    }

    // Check only availability (allow pending verification vehicles to accept loads)
    if (!lorry.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Lorry is not available',
      });
    }

    // Update load
    load.assignedLorryId = lorryId;
    load.status = 'Accepted';
    load.deliveryOTP = generateDeliveryOTP();
    await load.save();

    // Update lorry availability
    lorry.isAvailable = false;
    await lorry.save();

    // Update transaction
    await Transaction.findOneAndUpdate(
      { loadId: load._id },
      { lorryOwnerId: req.user._id }
    );

    // Notify company
    const company = await User.findById(load.companyId);
    await createNotification(
      company._id,
      'Load Accepted',
      `Your load #${load._id} has been accepted by ${req.user.name}`,
      'Load',
      'Load',
      load._id
    );

    // Send email
    try {
      await sendLoadStatusEmail(company.email, company.name, load._id, 'Accepted');
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    // Log activity
    await logActivity(
      req.user._id,
      'LOAD_ACCEPTED',
      'Load',
      load._id,
      'Lorry owner accepted load',
      { loadId: load._id, lorryId },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Load accepted successfully',
      load,
      deliveryOTP: load.deliveryOTP,
    });
  } catch (error) {
    console.error('Accept load error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting load',
      error: error.message,
    });
  }
};

// @desc    Update load status
// @route   PUT /api/loads/:id/status
// @access  Private (Lorry owner/Admin)
exports.updateLoadStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const load = await Load.findById(req.params.id).populate('companyId');

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    // Authorization check
    const lorry = await Lorry.findById(load.assignedLorryId);
    if (req.user.role !== 'admin' && (!lorry || lorry.ownerId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const validTransitions = {
      'Accepted': ['Reached Pickup', 'Cancelled'],
      'Reached Pickup': ['On Route', 'Cancelled'],
      'On Route': ['Delivered'],
      'Delivered': ['Completed'],
    };

    if (!validTransitions[load.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${load.status} to ${status}`,
      });
    }

    load.status = status;

    if (status === 'Reached Pickup') {
      load.pickupTime = new Date();
    } else if (status === 'Delivered') {
      load.deliveryTime = new Date();
    } else if (status === 'Completed') {
      // Mark lorry as available again
      if (lorry) {
        lorry.isAvailable = true;
        await lorry.save();
      }
    }

    await load.save();

    // Notify company
    await createNotification(
      load.companyId._id,
      'Load Status Updated',
      `Load #${load._id} status: ${status}`,
      'Status',
      'Load',
      load._id
    );

    // Send email
    try {
      await sendLoadStatusEmail(load.companyId.email, load.companyId.name, load._id, status);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    // Log activity
    await logActivity(
      req.user._id,
      'STATUS_CHANGED',
      'Load',
      load._id,
      `Load status changed to ${status}`,
      { loadId: load._id, status, notes },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      load,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message,
    });
  }
};

// @desc    Upload delivery proof
// @route   POST /api/loads/:id/delivery-proof
// @access  Private (Lorry owner only)
exports.uploadDeliveryProof = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id);

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    const lorry = await Lorry.findById(load.assignedLorryId);
    if (!lorry || lorry.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Upload to Cloudinary
    const proofUrl = await uploadToCloudinary(req.file.path, 'delivery-proofs');

    load.proofDocumentUrl = proofUrl;
    await load.save();

    res.status(200).json({
      success: true,
      message: 'Delivery proof uploaded successfully',
      load,
    });
  } catch (error) {
    console.error('Upload proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading delivery proof',
      error: error.message,
    });
  }
};

// @desc    Get company loads
// @route   GET /api/loads/company
// @access  Private (Company only)
exports.getCompanyLoads = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { companyId: req.user._id };
    if (status) query.status = status;

    const loads = await Load.find(query)
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

// @desc    Get lorry owner loads
// @route   GET /api/loads/lorry
// @access  Private (Lorry owner only)
exports.getLorryOwnerLoads = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Get all lorries of this owner
    const lorries = await Lorry.find({ ownerId: req.user._id });
    const lorryIds = lorries.map(l => l._id);

    const query = { assignedLorryId: { $in: lorryIds } };
    if (status) query.status = status;

    const loads = await Load.find(query)
      .populate('companyId', 'name phone ratingAverage ratingCount isVerified')
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

// @desc    Get load by ID
// @route   GET /api/loads/:id
// @access  Private
exports.getLoadById = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id)
      .populate('companyId', 'name phone email ratingAverage ratingCount isVerified')
      .populate({
        path: 'assignedLorryId',
        populate: {
          path: 'ownerId',
          select: 'name phone email ratingAverage ratingCount isVerified'
        }
      });

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    // Transform response to include lorryOwner for backward compatibility
    const loadObj = load.toObject();
    if (loadObj.assignedLorryId && loadObj.assignedLorryId.ownerId) {
      loadObj.lorryOwner = loadObj.assignedLorryId.ownerId;
    }

    res.status(200).json({
      success: true,
      load: loadObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching load',
      error: error.message,
    });
  }
};

// @desc    Download invoice
// @route   GET /api/loads/:id/invoice
// @access  Private
exports.downloadInvoice = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id)
      .populate('companyId')
      .populate('assignedLorryId');

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    // Authorization check
    if (load.companyId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const company = await User.findById(load.companyId._id);
    const fileName = await generateLoadInvoice(load, company, load.assignedLorryId);

    res.download(`uploads/${fileName}`, `invoice-${load._id}.pdf`);
  } catch (error) {
    console.error('Invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice',
      error: error.message,
    });
  }
};

// @desc    Update load details
// @route   PUT /api/loads/:id
// @access  Private (Company only)
exports.updateLoad = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id);

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    // Authorization check
    if (load.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this load' });
    }

    // Only allow updates for Posted or Approved loads (not yet accepted)
    if (!['Posted', 'Approved'].includes(load.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update load that has been accepted or is in progress',
      });
    }

    const {
      pickupLocation,
      dropLocation,
      goodsType,
      weight,
      requiredVehicleType,
      distance,
      specialInstructions,
    } = req.body;

    // Recalculate cost if distance or vehicle type changed
    const estimatedCost = distance || load.distance 
      ? calculateEstimatedCost(
          distance || load.distance,
          requiredVehicleType || load.requiredVehicleType,
          weight || load.weight
        )
      : load.estimatedCost;

    const estimatedDeliveryTime = distance || load.distance
      ? estimateDeliveryTime(distance || load.distance)
      : load.estimatedDeliveryTime;

    // Update fields
    if (pickupLocation) load.pickupLocation = pickupLocation;
    if (dropLocation) load.dropLocation = dropLocation;
    if (goodsType) load.goodsType = goodsType;
    if (weight) load.weight = weight;
    if (requiredVehicleType) load.requiredVehicleType = requiredVehicleType;
    if (distance) load.distance = distance;
    if (specialInstructions !== undefined) load.specialInstructions = specialInstructions;
    load.estimatedCost = estimatedCost;
    load.estimatedDeliveryTime = estimatedDeliveryTime;

    await load.save();

    // Log activity
    await logActivity(
      req.user._id,
      'LOAD_UPDATED',
      'Load',
      load._id,
      `Updated load #${load._id}`,
      { loadId: load._id, changes: req.body },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Load updated successfully',
      load,
    });
  } catch (error) {
    console.error('Update load error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating load',
      error: error.message,
    });
  }
};

// @desc    Delete/Cancel load
// @route   DELETE /api/loads/:id
// @access  Private (Company only)
exports.deleteLoad = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id);

    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    // Authorization check
    if (load.companyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this load' });
    }

    // Only allow deletion for Posted or Approved loads (not yet accepted)
    if (['Posted', 'Approved'].includes(load.status)) {
      // Hard delete if not yet accepted
      await Load.findByIdAndDelete(req.params.id);

      // Log activity
      await logActivity(
        req.user._id,
        'LOAD_DELETED',
        'Load',
        load._id,
        `Deleted load #${load._id}`,
        { loadId: load._id },
        req
      );

      res.status(200).json({
        success: true,
        message: 'Load deleted successfully',
      });
    } else if (['Accepted', 'Reached Pickup', 'On Route'].includes(load.status)) {
      // Soft delete - change status to Cancelled for accepted loads
      load.status = 'Cancelled';
      load.rejectionReason = req.body.reason || 'Cancelled by company';
      await load.save();

      // Free up the lorry if assigned
      if (load.assignedLorryId) {
        const lorry = await Lorry.findById(load.assignedLorryId);
        if (lorry) {
          lorry.isAvailable = true;
          await lorry.save();
        }

        // Notify lorry owner
        await createNotification(
          lorry.ownerId,
          'Load Cancelled',
          `Load #${load._id} has been cancelled by the company`,
          'warning',
          `/lorry/loads/${load._id}`
        );
      }

      // Log activity
      await logActivity(
        req.user._id,
        'LOAD_CANCELLED',
        'Load',
        load._id,
        `Cancelled load #${load._id}`,
        { loadId: load._id, reason: load.rejectionReason },
        req
      );

      res.status(200).json({
        success: true,
        message: 'Load cancelled successfully',
        load,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete/cancel load that has been delivered or completed',
      });
    }
  } catch (error) {
    console.error('Delete load error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting load',
      error: error.message,
    });
  }
};
