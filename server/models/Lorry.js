const mongoose = require('mongoose');

const lorrySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please provide vehicle number'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/, 'Please provide a valid vehicle number'],
  },
  vehicleType: {
    type: String,
    required: [true, 'Please select vehicle type'],
    enum: ['Mini Truck', 'Small Truck', 'Medium Truck', 'Large Truck', 'Container 20ft', 'Container 40ft', 'Trailer', 'Tanker'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide vehicle capacity in tons'],
  },
  driverName: {
    type: String,
    required: [true, 'Please provide driver name'],
  },
  driverPhone: {
    type: String,
    required: [true, 'Please provide driver phone'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
  },
  driverLicenseNumber: {
    type: String,
    required: [true, 'Please provide driver license number'],
  },
  insuranceNumber: String,
  insuranceExpiry: {
    type: Date,
    required: [true, 'Please provide insurance expiry date'],
  },
  rcDocumentUrl: {
    type: String,
    required: [true, 'Please upload RC document'],
  },
  insuranceDocumentUrl: String,
  licenseDocumentUrl: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  currentLocation: {
    city: String,
    state: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for performance
lorrySchema.index({ ownerId: 1 });
lorrySchema.index({ isVerified: 1, isAvailable: 1 });

// Check if insurance is expired
lorrySchema.virtual('isInsuranceValid').get(function () {
  return this.insuranceExpiry > Date.now();
});

module.exports = mongoose.model('Lorry', lorrySchema);
