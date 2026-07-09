const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// ========== GET USER PROFILE ==========
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 1,
            data: user
        });

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== UPDATE USER PROFILE ==========
const updateProfile = async (req, res) => {
    try {
        const {  name, phone, address, city, email, addresses,payments} = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            {  name, phone, address, city, email, addresses: addresses ||  [], payments:payments || [] },
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
            message: 'Profile updated successfully!',
            data: user
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== CHANGE PASSWORD ==========
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const bcrypt = require('bcrypt');

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                status: 0,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: 1,
            message: 'Password changed successfully!'
        });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET USER ORDERS ==========
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 1,
            data: orders
        });

    } catch (error) {
        console.error('Get User Orders Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET USER STATS ==========
const getUserStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments({ userId: req.userId });
        const orders = await Order.find({ userId: req.userId });
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

        // ========== CALCULATE AVERAGE RATING ==========
        // Get user's feedbacks
        const Feedbacks = require('../models/Feedback');
        const feedbacks = await Feedbacks.find({ 
            userId: req.userId,
            status: 'approved'
        });
        
        let averageRating = 0;
        if (feedbacks.length > 0) {
            const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
            averageRating = parseFloat((totalRating / feedbacks.length).toFixed(1));
        }

        // Get user's join date
        const user = await User.findById(req.userId);
        const memberSince = user?.createdAt || new Date();

        res.status(200).json({
            status: 1,
            data: {
                totalOrders,
                totalSpent,
                averageRating,  // ✅ Added
                memberSince: memberSince.toISOString()
            }
        });

    } catch (error) {
        console.error('Get User Stats Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET CART ==========
const getUserCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            cart = new Cart({
                userId: req.userId,
                items: [],
                subtotal: 0
            });
            await cart.save();
        }

        res.status(200).json({
            status: 1,
            data: cart
        });

    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getUserOrders,
    getUserStats,
    getUserCart
};