const Deal = require('../../models/Deal');

// ========== GET ALL DEALS ==========
const getAllDeals = async (req, res) => {
    try {
        const { status, category } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;

        const deals = await Deal.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            status: 1,
            message: 'Deals fetched successfully!',
            data: deals
        });

    } catch (error) {
        console.error('Get All Deals Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET SINGLE DEAL ==========
const getSingleDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const deal = await Deal.findById(id);

        if (!deal) {
            return res.status(404).json({
                status: 0,
                message: 'Deal not found'
            });
        }

        res.status(200).json({
            status: 1,
            data: deal
        });

    } catch (error) {
        console.error('Get Single Deal Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== ADD DEAL ==========
const addDeal = async (req, res) => {
    try {
        const { name, items, price, image, imageUrl, status, category } = req.body;

        const deal = new Deal({
            name,
            items,
            price,
            image: image || '🍕',
            imageUrl: imageUrl || '',
            status: status || 'active',
            category: category || 'classic'
        });

        await deal.save();

        res.status(201).json({
            status: 1,
            message: 'Deal added successfully!',
            data: deal
        });

    } catch (error) {
        console.error('Add Deal Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== UPDATE DEAL ==========
const updateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, items, price, image, imageUrl, status, category } = req.body;

        const deal = await Deal.findById(id);

        if (!deal) {
            return res.status(404).json({
                status: 0,
                message: 'Deal not found'
            });
        }

        if (name) deal.name = name;
        if (items) deal.items = items;
        if (price) deal.price = price;
        if (image) deal.image = image;
        if (imageUrl) deal.imageUrl = imageUrl;
        if (status) deal.status = status;
        if (category) deal.category = category;

        await deal.save();

        res.status(200).json({
            status: 1,
            message: 'Deal updated successfully!',
            data: deal
        });

    } catch (error) {
        console.error('Update Deal Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== DELETE DEAL ==========
const deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;

        const deal = await Deal.findByIdAndDelete(id);

        if (!deal) {
            return res.status(404).json({
                status: 0,
                message: 'Deal not found'
            });
        }

        res.status(200).json({
            status: 1,
            message: 'Deal deleted successfully!'
        });

    } catch (error) {
        console.error('Delete Deal Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== TOGGLE DEAL STATUS ==========
const toggleDealStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const deal = await Deal.findById(id);

        if (!deal) {
            return res.status(404).json({
                status: 0,
                message: 'Deal not found'
            });
        }

        deal.status = deal.status === 'active' ? 'inactive' : 'active';
        await deal.save();

        res.status(200).json({
            status: 1,
            message: `Deal status changed to ${deal.status}`,
            data: deal
        });

    } catch (error) {
        console.error('Toggle Deal Status Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

module.exports = {
    getAllDeals,
    getSingleDeal,
    addDeal,
    updateDeal,
    deleteDeal,
    toggleDealStatus
};