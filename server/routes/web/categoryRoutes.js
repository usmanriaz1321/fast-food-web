const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
    getAllCategories,
    getAllCategoriesAdmin,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} = require('../controllers/web/categoryController');

// Public Routes
router.get('/', getAllCategories);

// Admin Routes
router.get('/admin', isAdmin, getAllCategoriesAdmin);
router.post('/', isAdmin, addCategory);
router.put('/:id', isAdmin, updateCategory);
router.delete('/:id', isAdmin, deleteCategory);
router.patch('/:id/toggle', isAdmin, toggleCategoryStatus);

module.exports = router;