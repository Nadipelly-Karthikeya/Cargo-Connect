const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  loadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Load',
    required: true,
  },
  stars: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 500,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  isFlagged: {
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

// Index for performance
ratingSchema.index({ toUserId: 1 });
ratingSchema.index({ loadId: 1, fromUserId: 1 }, { unique: true });

// Update user's average rating after saving
ratingSchema.post('save', async function () {
  const User = mongoose.model('User');
  const ratings = await this.constructor.find({ toUserId: this.toUserId, isVisible: true });
  
  const avgRating = ratings.reduce((acc, rating) => acc + rating.stars, 0) / ratings.length;
  
  await User.findByIdAndUpdate(this.toUserId, {
    ratingAverage: avgRating.toFixed(2),
    ratingCount: ratings.length,
  });
});

module.exports = mongoose.model('Rating', ratingSchema);
