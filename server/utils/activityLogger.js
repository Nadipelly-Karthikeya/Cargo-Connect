const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async (userId, action, entityType, entityId, description, metadata = {}, req = null) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      entityType,
      entityId,
      description,
      metadata,
      ipAddress: req ? req.ip : null,
      userAgent: req ? req.headers['user-agent'] : null,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
