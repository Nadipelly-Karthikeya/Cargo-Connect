const express = require('express');
const router = express.Router();
const {
  addLorry,
  getMyLorries,
  getLorryById,
  updateLorry,
  deleteLorry,
  toggleAvailability,
} = require('../controllers/lorryController');
const { protect } = require('../middleware/authMiddleware');
const { isLorryOwner, authorize } = require('../middleware/roleMiddleware');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');

// Lorry owner routes
router.post(
  '/',
  protect,
  isLorryOwner,
  upload.fields([
    { name: 'rcDocument', maxCount: 1 },
    { name: 'insuranceDocument', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 },
  ]),
  handleMulterError,
  addLorry
);
router.get('/my-lorries', protect, isLorryOwner, getMyLorries);
router.get('/:id', protect, getLorryById);
router.put('/:id', protect, isLorryOwner, updateLorry);
router.delete('/:id', protect, authorize('lorry', 'admin'), deleteLorry);
router.put('/:id/availability', protect, isLorryOwner, toggleAvailability);

module.exports = router;
