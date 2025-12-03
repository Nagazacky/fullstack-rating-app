const router = require('express').Router();
const storeController = require('../controllers/storeController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Public: Everyone can see stores
router.get('/', storeController.getAllStores);

// Protected: Only Admin can add stores 
router.post('/', verifyToken, verifyAdmin, storeController.createStore);

// Protected: Any Logged-in User can rate 
router.post('/:storeId/rate', verifyToken, storeController.rateStore);

// Protected: Store Owner Dashboard
router.get('/owner/dashboard', verifyToken, storeController.getOwnerDashboard);
module.exports = router;