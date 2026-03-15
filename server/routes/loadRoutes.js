const express = require('express');
const router = express.Router();
const {
  createLoad,
  uploadPaymentScreenshot,
  getAvailableLoads,
  acceptLoad,
  updateLoadStatus,
  uploadDeliveryProof,
  getCompanyLoads,
  getLorryOwnerLoads,
  getLoadById,
  downloadInvoice,
  updateLoad,
  deleteLoad,
} = require('../controllers/loadController');
const { protect } = require('../middleware/authMiddleware');
const { isCompany, isLorryOwner, authorize } = require('../middleware/roleMiddleware');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');

// Company routes
router.post('/', protect, isCompany, createLoad);
router.post('/:id/payment', protect, isCompany, upload.single('payment'), handleMulterError, uploadPaymentScreenshot);
router.get('/company', protect, isCompany, getCompanyLoads);
router.put('/:id', protect, isCompany, updateLoad);
router.delete('/:id', protect, authorize('company', 'admin'), deleteLoad);

// Lorry owner routes
router.get('/available', protect, isLorryOwner, getAvailableLoads);
router.post('/:id/accept', protect, isLorryOwner, acceptLoad);
router.get('/lorry', protect, isLorryOwner, getLorryOwnerLoads);
router.post('/:id/delivery-proof', protect, isLorryOwner, upload.single('proof'), handleMulterError, uploadDeliveryProof);

// Shared routes
router.get('/:id', protect, getLoadById);
router.put('/:id/status', protect, authorize('lorry', 'admin'), updateLoadStatus);
router.get('/:id/invoice', protect, downloadInvoice);

module.exports = router;
