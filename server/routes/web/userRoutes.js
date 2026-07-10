const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const {
    getProfile,
    updateProfile,
    changePassword,
    getUserOrders,
    getUserStats,
    getUserCart
} = require('../../controllers/web/userController');

// All routes require authentication
router.use(auth);

// Profile Routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Order Routes
router.get('/orders', getUserOrders);
router.get('/stats', getUserStats);

// Cart Routes
router.get('/cart', getUserCart);

module.exports = router;