const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../../middleware/auth');
const {
    getAllDeals,
    getSingleDeal,
    addDeal,
    updateDeal,
    deleteDeal,
    toggleDealStatus
} = require('../../controllers/web/dealController');

// Public Routes
router.get('/', getAllDeals);
router.get('/:id', getSingleDeal);

// Admin Routes
router.post('/', isAdmin, addDeal);
router.put('/:id', isAdmin, updateDeal);
router.delete('/:id', isAdmin, deleteDeal);
router.patch('/:id/toggle', isAdmin, toggleDealStatus);

module.exports = router;