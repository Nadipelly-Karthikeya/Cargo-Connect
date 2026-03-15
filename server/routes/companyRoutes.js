const express = require('express');
const router = express.Router();
const {
  updateCompanyProfile,
  getCompanyProfile,
  getCompanyStats,
} = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { isCompany } = require('../middleware/roleMiddleware');

// Company routes
router.get('/profile', protect, isCompany, getCompanyProfile);
router.put('/profile', protect, isCompany, updateCompanyProfile);
router.get('/stats', protect, isCompany, getCompanyStats);

module.exports = router;
