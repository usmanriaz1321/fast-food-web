// serv../controllers/web/menuController.js
const MenuItem = require('../models/MenuItem');
const categorySizes = require('../models/categorySizes');

// ========== HELPER: Parse sizes from various formats ==========
const parseSizes = (sizes) => {
    if (!sizes) return [];
    
    // If it's a string (coming from frontend as stringified data)
    if (typeof sizes === 'string') {
        try {
            // Remove Proxy() wrapper and clean
            let clean = sizes.replace(/Proxy\(|\)/g, '').trim();
            
            // Try to parse as JSON
            let parsed;
            try {
                parsed = JSON.parse(clean);
            } catch (jsonError) {
                // Try eval for JS object format
                parsed = eval(`(${clean})`);
            }
            
            if (Array.isArray(parsed)) {
                return parsed.map(s => ({
                    name: String(s.name || s),
                    price: parseFloat(s.price) || 0
                }));
            }
            return [];
        } catch (e) {
            console.error('Failed to parse sizes:', e);
            return [];
        }
    }
    
    // If it's already an array
    if (Array.isArray(sizes)) {
        return sizes.map(s => {
            // If it's a string like "Small", convert to object with price 0
            if (typeof s === 'string') {
                return { name: s, price: 0 };
            }
            // If it's an object with name and price
            if (typeof s === 'object' && s.name) {
                return {
                    name: String(s.name),
                    price: parseFloat(s.price) || 0
                };
            }
            return { name: String(s), price: 0 };
        });
    }
    
    return [];
};

// ========== GET SINGLE MENU ITEM ==========
const getSingleItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await MenuItem.findById(id);

        if (!item) {
            return res.status(404).json({
                status: 0,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            status: 1,
            data: item
        });

    } catch (error) {
        console.error('Get Single Item Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== ADD MENU ITEM ==========
const addItem = async (req, res) => {
    try {
        const { 
            name, 
            category, 
            price, 
            sizes, 
            image, 
            imageUrl, 
            description, 
            status, 
            isPopular
        } = req.body;

        // ✅ Parse sizes to array of objects with name and price
        const parsedSizes = parseSizes(sizes);
        console.log('Parsed sizes with prices:', parsedSizes);

        // Check if item already exists
        const existingItem = await MenuItem.findOne({ name });
        if (existingItem) {
            return res.status(400).json({
                status: 0,
                message: 'Menu item already exists'
            });
        }

        const itemData = {
            name,
            category,
            image: image || '🍕',
            imageUrl: imageUrl || '',
            description: description || '',
            status: status || 'active',
            isPopular: isPopular || false
        };

        // ✅ Handle sizes based on category
        const hasSizes = categorySizes[category]?.hasSizes || false;

        if (hasSizes && parsedSizes.length > 0) {
            // ✅ Store all sizes with their prices
            itemData.sizes = parsedSizes;
            // ✅ Set price as the first size's price (for backward compatibility)
            itemData.price = parsedSizes[0].price || 0;
        } else if (price !== undefined && price !== null) {
            // For categories with single price
            itemData.price = parseFloat(price);
            itemData.sizes = [];
        } else {
            return res.status(400).json({
                status: 0,
                message: 'Price or sizes are required'
            });
        }

        const item = new MenuItem(itemData);
        await item.save();

        res.status(201).json({
            status: 1,
            message: 'Menu item added successfully!',
            data: item
        });

    } catch (error) {
        console.error('Add Item Error:', error);
        res.status(500).json({
            status: 0,
            message: error.message || 'Server error. Please try again.'
        });
    }
};

// ========== UPDATE MENU ITEM ==========
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            category, 
            price, 
            sizes, 
            image, 
            imageUrl, 
            description, 
            status, 
            isPopular
        } = req.body;

        const item = await MenuItem.findById(id);
        if (!item) {
            return res.status(404).json({
                status: 0,
                message: 'Menu item not found'
            });
        }

        // Update basic fields
        if (name) item.name = name;
        if (category) item.category = category;
        if (image) item.image = image;
        if (imageUrl) item.imageUrl = imageUrl;
        if (description) item.description = description;
        if (status) item.status = status;
        if (isPopular !== undefined) item.isPopular = isPopular;

        // ✅ Parse sizes if provided
        if (sizes !== undefined) {
            const parsedSizes = parseSizes(sizes);
            
            const hasSizes = categorySizes[category || item.category]?.hasSizes || false;
            
            if (hasSizes && parsedSizes.length > 0) {
                // ✅ Store all sizes with their prices
                item.sizes = parsedSizes;
                // ✅ Update price as the first size's price
                item.price = parsedSizes[0].price || 0;
            } else if (hasSizes && parsedSizes.length === 0) {
                return res.status(400).json({
                    status: 0,
                    message: 'Please provide at least one size'
                });
            } else if (!hasSizes && price !== undefined && price !== null) {
                item.price = parseFloat(price);
                item.sizes = [];
            }
        } else if (price !== undefined && price !== null) {
            // Only price updated, not sizes
            item.price = parseFloat(price);
        }

        await item.save();

        res.status(200).json({
            status: 1,
            message: 'Menu item updated successfully!',
            data: item
        });

    } catch (error) {
        console.error('Update Item Error:', error);
        res.status(500).json({
            status: 0,
            message: error.message || 'Server error. Please try again.'
        });
    }
};

// ========== GET ALL ITEMS ==========
const getAllItems = async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            status: 1,
            data: items
        });
    } catch (error) {
        console.error('Get All Items Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== DELETE MENU ITEM ==========
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const item = await MenuItem.findByIdAndDelete(id);
        if (!item) {
            return res.status(404).json({
                status: 0,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            status: 1,
            message: 'Menu item deleted successfully!'
        });

    } catch (error) {
        console.error('Delete Item Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== TOGGLE ITEM STATUS ==========
const toggleItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const item = await MenuItem.findById(id);
        if (!item) {
            return res.status(404).json({
                status: 0,
                message: 'Menu item not found'
            });
        }

        item.status = item.status === 'active' ? 'inactive' : 'active';
        await item.save();

        res.status(200).json({
            status: 1,
            message: `Item ${item.status === 'active' ? 'activated' : 'deactivated'} successfully!`,
            data: item
        });

    } catch (error) {
        console.error('Toggle Item Status Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== EXPORT ==========
module.exports = {
    getAllItems,
    getSingleItem,
    addItem,
    updateItem,
    deleteItem,
    toggleItemStatus
};