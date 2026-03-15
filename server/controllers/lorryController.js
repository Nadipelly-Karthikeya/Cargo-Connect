const Lorry = require('../models/Lorry');
const { uploadToCloudinary } = require('../config/cloudinary');
const { logActivity } = require('../utils/activityLogger');
const fs = require('fs');

// @desc    Add new lorry
// @route   POST /api/lorries
// @access  Private (Lorry owner only)
exports.addLorry = async (req, res) => {
  try {
    console.log('=== ADD LORRY REQUEST ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        console.log(`${key}:`, req.files[key].length, 'file(s)');
      });
    }
    
    const {
      vehicleNumber,
      vehicleType,
      capacity,
      driverName,
      driverPhone,
      driverLicenseNumber,
      insuranceNumber,
      insuranceExpiry,
      currentLocation,
    } = req.body;

    // Parse currentLocation if it's a JSON string
    let locationData = currentLocation
    if (typeof currentLocation === 'string') {
      try {
        locationData = JSON.parse(currentLocation)
      } catch (e) {
        // If it's just a string, convert to object
        locationData = { city: currentLocation, state: '' }
      }
    }

    console.log('Parsed location:', locationData);

    // Check if vehicle already exists
    const existingLorry = await Lorry.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (existingLorry) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this number already exists',
      });
    }

    // Handle file uploads
    if (!req.files || !req.files.rcDocument) {
      console.log('Missing RC document');
      return res.status(400).json({
        success: false,
        message: 'Please upload RC document',
      });
    }

    // Upload RC document
    const rcDocumentUrl = await uploadToCloudinary(req.files.rcDocument[0].path, 'documents/rc');

    let insuranceDocumentUrl = null;
    if (req.files.insuranceDocument) {
      insuranceDocumentUrl = await uploadToCloudinary(req.files.insuranceDocument[0].path, 'documents/insurance');
    }

    let licenseDocumentUrl = null;
    if (req.files.licenseDocument) {
      licenseDocumentUrl = await uploadToCloudinary(req.files.licenseDocument[0].path, 'documents/license');
    }

    // Create lorry
    const lorry = await Lorry.create({
      ownerId: req.user._id,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      capacity,
      driverName,
      driverPhone,
      driverLicenseNumber,
      insuranceNumber,
      insuranceExpiry,
      rcDocumentUrl,
      insuranceDocumentUrl,
      licenseDocumentUrl,
      currentLocation: locationData,
    });

    console.log('Lorry created successfully:', lorry._id);

    // Log activity
    await logActivity(
      req.user._id,
      'LORRY_ADDED',
      'Lorry',
      lorry._id,
      `Added new vehicle: ${vehicleNumber}`,
      { vehicleNumber, vehicleType },
      req
    );

    res.status(201).json({
      success: true,
      message: 'Lorry added successfully. Waiting for admin verification.',
      lorry,
    });
  } catch (error) {
    console.error('Add lorry error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error adding lorry',
      error: error.message,
    });
  }
};

// @desc    Get all lorries of owner
// @route   GET /api/lorries/my-lorries
// @access  Private (Lorry owner only)
exports.getMyLorries = async (req, res) => {
  try {
    const lorries = await Lorry.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: lorries.length,
      lorries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lorries',
      error: error.message,
    });
  }
};

// @desc    Get lorry by ID
// @route   GET /api/lorries/:id
// @access  Private
exports.getLorryById = async (req, res) => {
  try {
    const lorry = await Lorry.findById(req.params.id).populate('ownerId', 'name phone ratingAverage');

    if (!lorry) {
      return res.status(404).json({
        success: false,
        message: 'Lorry not found',
      });
    }

    res.status(200).json({
      success: true,
      lorry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lorry',
      error: error.message,
    });
  }
};

// @desc    Update lorry
// @route   PUT /api/lorries/:id
// @access  Private (Lorry owner only)
exports.updateLorry = async (req, res) => {
  try {
    let lorry = await Lorry.findById(req.params.id);

    if (!lorry) {
      return res.status(404).json({
        success: false,
        message: 'Lorry not found',
      });
    }

    // Check ownership
    if (lorry.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lorry',
      });
    }

    const {
      vehicleType,
      capacity,
      driverName,
      driverPhone,
      driverLicenseNumber,
      insuranceNumber,
      insuranceExpiry,
      currentLocation,
    } = req.body;

    // Parse currentLocation if it's a JSON string
    let locationData = currentLocation
    if (typeof currentLocation === 'string') {
      try {
        locationData = JSON.parse(currentLocation)
      } catch (e) {
        locationData = { city: currentLocation, state: '' }
      }
    }

    // Prepare update data
    const updateData = {
      vehicleType,
      capacity,
      driverName,
      driverPhone,
      driverLicenseNumber,
      insuranceNumber,
      insuranceExpiry,
      currentLocation: locationData,
    }

    // Handle document uploads if any
    if (req.files) {
      if (req.files.rcDocument) {
        const rcDocumentUrl = await uploadToCloudinary(req.files.rcDocument[0].path, 'documents/rc');
        updateData.rcDocumentUrl = rcDocumentUrl;
      }
      if (req.files.insuranceDocument) {
        const insuranceDocumentUrl = await uploadToCloudinary(req.files.insuranceDocument[0].path, 'documents/insurance');
        updateData.insuranceDocumentUrl = insuranceDocumentUrl;
      }
      if (req.files.licenseDocument) {
        const licenseDocumentUrl = await uploadToCloudinary(req.files.licenseDocument[0].path, 'documents/license');
        updateData.licenseDocumentUrl = licenseDocumentUrl;
      }
    }

    lorry = await Lorry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log activity
    await logActivity(
      req.user._id,
      'LORRY_UPDATED',
      'Lorry',
      lorry._id,
      `Updated vehicle: ${lorry.vehicleNumber}`,
      { vehicleNumber: lorry.vehicleNumber },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Lorry updated successfully',
      lorry,
    });
  } catch (error) {
    console.error('Update lorry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lorry',
      error: error.message,
    });
  }
};

// @desc    Delete lorry
// @route   DELETE /api/lorries/:id
// @access  Private (Lorry owner only)
exports.deleteLorry = async (req, res) => {
  try {
    const lorry = await Lorry.findById(req.params.id);

    if (!lorry) {
      return res.status(404).json({
        success: false,
        message: 'Lorry not found',
      });
    }

    // Check ownership
    if (lorry.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lorry',
      });
    }

    // Check if lorry is currently assigned to a load
    if (!lorry.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete lorry that is currently assigned to a load',
      });
    }

    await Lorry.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity(
      req.user._id,
      'LORRY_DELETED',
      'Lorry',
      lorry._id,
      `Deleted vehicle: ${lorry.vehicleNumber}`,
      { vehicleNumber: lorry.vehicleNumber },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Lorry deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lorry',
      error: error.message,
    });
  }
};

// @desc    Toggle lorry availability
// @route   PUT /api/lorries/:id/availability
// @access  Private (Lorry owner only)
exports.toggleAvailability = async (req, res) => {
  try {
    const lorry = await Lorry.findById(req.params.id);

    if (!lorry) {
      return res.status(404).json({
        success: false,
        message: 'Lorry not found',
      });
    }

    // Check ownership
    if (lorry.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    lorry.isAvailable = !lorry.isAvailable;
    await lorry.save();

    res.status(200).json({
      success: true,
      message: `Lorry is now ${lorry.isAvailable ? 'available' : 'unavailable'}`,
      lorry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling availability',
      error: error.message,
    });
  }
};
