const express = require('express');
const router = express.Router();
const {
  createDispute,
  getMyDisputes,
  getAllDisputes,
  resolveDispute,
  getDisputeById,
} = require('../controllers/disputeController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');

// User routes
router.post('/', protect, upload.array('evidence', 5), handleMulterError, createDispute);
router.get('/my-disputes', protect, getMyDisputes);
router.get('/:id', protect, getDisputeById);

// Admin routes
router.get('/all/list', protect, isAdmin, getAllDisputes);
router.put('/:id/resolve', protect, isAdmin, resolveDispute);

module.exports = router;
