const express = require('express');
const router = express.Router();
const {
  createRating,
  getUserRatings,
  getMyRatings,
  canRate,
} = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

// Validation
const ratingValidation = [
  body('toUserId').notEmpty().withMessage('Target user ID is required'),
  body('loadId').notEmpty().withMessage('Load ID is required'),
  body('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters'),
];

// Routes
router.post('/', protect, ratingValidation, validate, createRating);
router.get('/user/:userId', getUserRatings);
router.get('/my-ratings', protect, getMyRatings);
router.get('/can-rate/:loadId', protect, canRate);

module.exports = router;
