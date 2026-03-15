const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  toggleUserSuspension,
  getAllLoads,
  approveLoad,
  getAllLorries,
  verifyLorry,
  getAllTransactions,
  getAnalytics,
  removeRating,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// All routes require admin authentication
router.use(protect);
router.use(isAdmin);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', toggleUserSuspension);

// Load management
router.get('/loads', getAllLoads);
router.put('/loads/:id/approve', approveLoad);

// Lorry management
router.get('/lorries', getAllLorries);
router.put('/lorries/:id/verify', verifyLorry);

// Transaction management
router.get('/transactions', getAllTransactions);

// Analytics
router.get('/analytics', getAnalytics);

// Rating management
router.delete('/ratings/:id', removeRating);

module.exports = router;
