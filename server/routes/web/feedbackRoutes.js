const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../../middleware/auth');
const {
    submitFeedback,
    getFeedbacks,
    getOrderFeedback,
    getAllFeedbacks,
    approveFeedback,
    deleteFeedback
} = require('../../controllers/web/feedbackController');

// Public Routes
router.get('/', getFeedbacks);

// User Routes (Logged in)
router.post('/', auth, submitFeedback);
router.get('/order/:orderId', auth, getOrderFeedback);

// Admin Routes
router.get('/admin', isAdmin, getAllFeedbacks);
router.put('/admin/:id/approve', isAdmin, approveFeedback);
router.delete('/admin/:id', isAdmin, deleteFeedback);

module.exports = router;