const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedLorryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lorry',
    default: null,
  },
  pickupLocation: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  dropLocation: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  goodsType: {
    type: String,
    required: [true, 'Please specify goods type'],
    enum: ['Electronics', 'Furniture', 'Food', 'Chemicals', 'Textiles', 'Machinery', 'Automotive Parts', 'Construction Materials', 'Pharmaceuticals', 'General Cargo', 'Other'],
  },
  weight: {
    type: Number,
    required: [true, 'Please specify weight in tons'],
  },
  requiredVehicleType: {
    type: String,
    required: [true, 'Please select required vehicle type'],
    enum: ['Mini Truck', 'Small Truck', 'Medium Truck', 'Large Truck', 'Container 20ft', 'Container 40ft', 'Trailer', 'Tanker'],
  },
  distance: {
    type: Number,
    required: true,
  },
  estimatedCost: {
    type: Number,
    required: [true, 'Please provide estimated cost'],
  },
  status: {
    type: String,
    enum: ['Posted', 'Approved', 'Accepted', 'Reached Pickup', 'On Route', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Posted',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Screenshot Uploaded', 'Verified', 'Failed'],
    default: 'Pending',
  },
  paymentScreenshotUrl: String,
  proofDocumentUrl: String,
  deliveryOTP: String,
  specialInstructions: String,
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  pickupTime: Date,
  deliveryTime: Date,
  estimatedDeliveryTime: Date,
  isAdminApproved: {
    type: Boolean,
    default: false,
  },
  rejectionReason: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for performance
loadSchema.index({ companyId: 1, status: 1 });
loadSchema.index({ assignedLorryId: 1, status: 1 });
loadSchema.index({ status: 1, isAdminApproved: 1 });
loadSchema.index({ createdAt: -1 });

// Add status to history before updating
loadSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model('Load', loadSchema);
