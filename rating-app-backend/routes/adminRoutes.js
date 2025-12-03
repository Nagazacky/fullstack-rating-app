const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// This matches GET /api/admin/dashboard
router.get('/dashboard', verifyToken, verifyAdmin, adminController.getDashboardStats);

module.exports = router;