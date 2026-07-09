const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const {
    getStats,
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    getAllOrders,
    updateOrderStatus,
    getOrderById,
    getAllMenuItems,
    getAllDeals
} = require('../controllers/adminController');

// All routes require admin authentication
router.use(isAdmin);

// Dashboard
router.get('/stats', getStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

// Menu & Deals
router.get('/menu', getAllMenuItems);
router.get('/deals', getAllDeals);

module.exports = router;