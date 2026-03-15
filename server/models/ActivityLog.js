const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_REGISTERED',
      'EMAIL_VERIFIED',
      'PROFILE_UPDATED',
      'LOAD_CREATED',
      'LOAD_UPDATED',
      'LOAD_ACCEPTED',
      'LOAD_CANCELLED',
      'STATUS_CHANGED',
      'PAYMENT_UPLOADED',
      'PAYMENT_VERIFIED',
      'PAYMENT_REJECTED',
      'LORRY_ADDED',
      'LORRY_VERIFIED',
      'LORRY_REJECTED',
      'RATING_GIVEN',
      'RATING_REMOVED',
      'DISPUTE_RAISED',
      'DISPUTE_RESOLVED',
      'USER_SUSPENDED',
      'USER_ACTIVATED',
      'ADMIN_ACTION',
      'OTHER',
    ],
  },
  entityType: {
    type: String,
    enum: ['User', 'Load', 'Lorry', 'Transaction', 'Rating', 'Dispute', 'Other'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String,
    required: true,
  },
  ipAddress: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000, // Auto-delete after 90 days
  },
}, {
  timestamps: true,
});

// Index for performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
