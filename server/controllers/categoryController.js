const Category = require('../models/category');

// ========== GET ALL CATEGORIES ==========
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            status: 1,
            data: categories
        });
    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET ALL CATEGORIES (ADMIN) ==========
const getAllCategoriesAdmin = async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            status: 1,
            data: categories
        });
    } catch (error) {
        console.error('Get Categories Admin Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== ADD CATEGORY ==========
// ========== ADD CATEGORY ==========
const addCategory = async (req, res) => {
    try {
        const { name, icon, color, count, order, imageUrl } = req.body;

        // Check if category exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                status: 0,
                message: 'Category already exists'
            });
        }

        const category = new Category({
            name,
            icon: icon || '🍕',
            color: color || '#FBE3B8',
            count: count || '0 items',
            order: order || 0,
            imageUrl: imageUrl || '',  // ✅ Make sure this is saved
            status: 'active'
        });

        await category.save();

        res.status(201).json({
            status: 1,
            message: 'Category added successfully!',
            data: category
        });
    } catch (error) {
        console.error('Add Category Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== UPDATE CATEGORY ==========
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, imageUrl, color, count, status, order } = req.body;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                status: 0,
                message: 'Category not found'
            });
        }

        if (name) category.name = name;
        if (icon) category.icon = icon;
        if (imageUrl) category.imageUrl = imageUrl;
        if (color) category.color = color;
        if (count) category.count = count;
        if (status) category.status = status;
        if (order !== undefined) category.order = order;

        await category.save();

        res.status(200).json({
            status: 1,
            message: 'Category updated successfully!',
            data: category
        });
    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== DELETE CATEGORY ==========
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                status: 0,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            status: 1,
            message: 'Category deleted successfully!'
        });
    } catch (error) {
        console.error('Delete Category Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== TOGGLE CATEGORY STATUS ==========
const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                status: 0,
                message: 'Category not found'
            });
        }

        category.status = category.status === 'active' ? 'inactive' : 'active';
        await category.save();

        res.status(200).json({
            status: 1,
            message: `Category ${category.status === 'active' ? 'activated' : 'deactivated'}!`,
            data: category
        });
    } catch (error) {
        console.error('Toggle Category Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

module.exports = {
    getAllCategories,
    getAllCategoriesAdmin,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
};