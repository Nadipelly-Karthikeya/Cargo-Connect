const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true,
  },
  gstNumber: {
    type: String,
    required: [true, 'Please provide GST number'],
    unique: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please provide a valid GST number'],
  },
  goodsType: [{
    type: String,
    enum: ['Electronics', 'Furniture', 'Food', 'Chemicals', 'Textiles', 'Machinery', 'Automotive Parts', 'Construction Materials', 'Pharmaceuticals', 'General Cargo', 'Other'],
  }],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
  },
  documentsUrl: {
    gstCertificate: String,
    companyRegistration: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for performance (userId and gstNumber already indexed via unique: true)

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
