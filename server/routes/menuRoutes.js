const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
    getAllItems,
    getSingleItem,
    addItem,
    updateItem,
    deleteItem,
    toggleItemStatus
} = require('../controllers/menuController');

// Public Routes
router.get('/', getAllItems);
router.get('/:id', getSingleItem);

// Admin Routes
router.post('/', isAdmin, addItem);
router.put('/:id', isAdmin, updateItem);
router.delete('/:id', isAdmin, deleteItem);
router.patch('/:id/toggle', isAdmin, toggleItemStatus);

module.exports = router;