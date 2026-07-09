const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Deal = require('../models/Deal');
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');


// ========== GET DASHBOARD STATS ==========
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMenuItems = await MenuItem.countDocuments();
        const totalDeals = await Deal.countDocuments();
        const totalOrders = await Order.countDocuments();

        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const todayOrders = await Order.countDocuments({
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
        });

        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        // Top selling item
        const topSelling = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 1 }
        ]);

        res.status(200).json({
            status: 1,
            data: {
                totalUsers,
                totalMenuItems,
                totalDeals,
                totalOrders,
                totalRevenue,
                pendingOrders,
                todayOrders,
                topSelling: topSelling.length > 0 ? topSelling[0]._id : 'N/A'
            }
        });

    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET ALL USERS ==========
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            status: 1,
            data: users
        });

    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET USER BY ID ==========
// controllers/adminController.js

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ✅ Get user
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        // ✅ Get user stats
        const orders = await Order.find({ userId: id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

        // ✅ Get average rating
        const feedbacks = await Feedback.find({ 
            userId: id,
            status: 'approved'
        });
        let averageRating = 0;
        if (feedbacks.length > 0) {
            const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
            averageRating = parseFloat((totalRating / feedbacks.length).toFixed(1));
        }

        // ✅ Return user with stats
        res.status(200).json({
            status: 1,
            data: {
                ...user.toObject(),
                totalOrders,
                totalSpent,
                averageRating
            }
        });

    } catch (error) {
        console.error('Get User By ID Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== UPDATE USER STATUS ==========
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['active', 'inactive', 'blocked'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 0,
                message: 'Invalid status. Must be active, inactive, or blocked'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 1,
            message: 'User status updated successfully!',
            data: user
        });

    } catch (error) {
        console.error('Update User Status Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== DELETE USER ==========
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        // Delete user's cart and orders
        // await Cart.deleteMany({ userId: id });
        // await Order.deleteMany({ userId: id });

        res.status(200).json({
            status: 1,
            message: 'User deleted successfully!'
        });

    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET ALL ORDERS ==========
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 1,
            data: orders
        });

    } catch (error) {
        console.error('Get All Orders Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== UPDATE ORDER STATUS (Admin) ==========
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Preparing', 'On Delivery', 'Delivered', 'Cancelled','CancelledByUser'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 0,
                message: 'Invalid status'
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                status: 0,
                message: 'Order not found'
            });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            status: 1,
            message: 'Order status updated successfully!',
            data: order
        });

    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET ORDER BY ID ==========
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('userId', 'name email phone');

        if (!order) {
            return res.status(404).json({
                status: 0,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            status: 1,
            data: order
        });

    } catch (error) {
        console.error('Get Order By ID Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET ALL MENU ITEMS (Admin) ==========
const getAllMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 1,
            data: items
        });
    } catch (error) {
        console.error('Get All Menu Items Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET ALL DEALS (Admin) ==========
const getAllDeals = async (req, res) => {
    try {
        const deals = await Deal.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 1,
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

module.exports = {
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
};