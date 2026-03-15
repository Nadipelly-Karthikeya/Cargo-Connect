const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  loadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Load',
    required: true,
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  againstUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide dispute title'],
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Please provide dispute description'],
    maxlength: 2000,
  },
  category: {
    type: String,
    enum: ['Payment Issue', 'Delivery Issue', 'Quality Issue', 'Damage', 'Delay', 'Communication Issue', 'Other'],
    required: true,
  },
  evidenceUrls: [String],
  status: {
    type: String,
    enum: ['Open', 'Under Review', 'Resolved', 'Rejected'],
    default: 'Open',
  },
  resolution: String,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolutionDate: Date,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for performance
disputeSchema.index({ loadId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ raisedBy: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
