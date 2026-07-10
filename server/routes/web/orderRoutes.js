const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../../middleware/auth');
const {
    placeOrder,
    getOrders,
    getSingleOrder,
    updateOrderStatus
} = require('../../controllers/web/orderController');

// User Routes
router.use(auth);
router.post('/', placeOrder);
router.get('/', getOrders);
router.get('/:id', getSingleOrder);

// Admin Routes
router.put('/:id/status', isAdmin, updateOrderStatus);

module.exports = router;