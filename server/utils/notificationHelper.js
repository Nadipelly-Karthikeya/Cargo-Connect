const Notification = require('../models/Notification');

// Create notification
exports.createNotification = async (userId, title, message, type, relatedEntityType, relatedEntityId) => {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
      relatedEntityType,
      relatedEntityId,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Create notification for multiple users
exports.createBulkNotifications = async (userIds, title, message, type) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type,
    }));
    
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
  }
};
