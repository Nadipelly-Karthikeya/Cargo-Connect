const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  loadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Load',
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lorryOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
  },
  screenshotUrl: {
    type: String,
    required: [true, 'Please upload payment screenshot'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  verifiedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verificationDate: Date,
  rejectionReason: String,
  transactionId: String,
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Bank Transfer', 'Card', 'Cash', 'Other'],
    default: 'UPI',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for performance
transactionSchema.index({ loadId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ companyId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
