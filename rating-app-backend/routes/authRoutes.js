const router = require('express').Router();
const authController = require('../controllers/authController');

// This matches POST /api/auth/signup
router.post('/signup', authController.signup);

// This matches POST /api/auth/login
router.post('/login', authController.login);

const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Admin only: Get all users
router.get('/users', verifyToken, verifyAdmin, authController.getAllUsers);

// Protected: Change Password
router.put('/change-password', verifyToken, authController.changePassword);
module.exports = router;