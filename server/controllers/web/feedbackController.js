const Feedback = require('../models/Feedback');

// ========== SUBMIT FEEDBACK ==========
const submitFeedback = async (req, res) => {
    try {
        console.log('📝 Feedback Request Body:', req.body);
        console.log('👤 User:', req.user);
        console.log('🆔 User ID:', req.userId);

        const { orderId, rating, review, location } = req.body;
        const userId = req.userId;

        // ✅ Validate required fields
        if (!orderId) {
            return res.status(400).json({
                status: 0,
                message: 'Order ID is required'
            });
        }

        if (!rating) {
            return res.status(400).json({
                status: 0,
                message: 'Rating is required'
            });
        }

        if (!review) {
            return res.status(400).json({
                status: 0,
                message: 'Review is required'
            });
        }

        // ✅ Check if user exists
        if (!userId) {
            return res.status(401).json({
                status: 0,
                message: 'User not authenticated'
            });
        }

        // ✅ Check if user has name and email
        if (!req.user || !req.user.name || !req.user.email) {
            return res.status(400).json({
                status: 0,
                message: 'User name and email are required'
            });
        }

        // Check if feedback already exists for this order
        const existingFeedback = await Feedback.findOne({ orderId });
        if (existingFeedback) {
            return res.status(400).json({
                status: 0,
                message: 'You already submitted feedback for this order'
            });
        }

        const feedback = new Feedback({
            userId,
            orderId,
            name: req.user.name,
            email: req.user.email,
            rating,
            review,
            location: location || '',
            isVerified: true
        });

        await feedback.save();

        res.status(201).json({
            status: 1,
            message: 'Thank you for your feedback! ❤️',
            data: feedback
        });

    } catch (error) {
        console.error('❌ Submit Feedback Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error: ' + error.message
        });
    }
};

// ... rest of the controller

// ========== GET ALL FEEDBACK (PUBLIC - Only Approved) ==========
const getFeedbacks = async (req, res) => {
    try {
        const { limit = 4 } = req.query;
        const feedbacks = await Feedback.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Calculate average rating
        const allApproved = await Feedback.find({ status: 'approved' });
        const total = allApproved.length;
        const avgRating = total > 0 
            ? (allApproved.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
            : 0;

        res.status(200).json({
            status: 1,
            data: {
                feedbacks,
                stats: {
                    total,
                    averageRating: avgRating,
                    recommendRate: total > 0 
                        ? Math.round(allApproved.filter(f => f.rating >= 4).length / total * 100)
                        : 0
                }
            }
        });

    } catch (error) {
        console.error('Get Feedbacks Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET FEEDBACK FOR ORDER (User) ==========
const getOrderFeedback = async (req, res) => {
    try {
        const { orderId } = req.params;
        const feedback = await Feedback.findOne({ 
            orderId, 
            userId: req.userId 
        });

        res.status(200).json({
            status: 1,
            data: feedback || null
        });

    } catch (error) {
        console.error('Get Order Feedback Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET ALL FEEDBACK (ADMIN) ==========
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 1,
            data: feedbacks
        });

    } catch (error) {
        console.error('Get All Feedbacks Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== APPROVE FEEDBACK (ADMIN) ==========
const approveFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { status: 'approved' },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({
                status: 0,
                message: 'Feedback not found'
            });
        }

        res.status(200).json({
            status: 1,
            message: 'Feedback approved!',
            data: feedback
        });

    } catch (error) {
        console.error('Approve Feedback Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== DELETE FEEDBACK (ADMIN) ==========
const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findByIdAndDelete(id);

        if (!feedback) {
            return res.status(404).json({
                status: 0,
                message: 'Feedback not found'
            });
        }

        res.status(200).json({
            status: 1,
            message: 'Feedback deleted successfully!'
        });

    } catch (error) {
        console.error('Delete Feedback Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

module.exports = {
    submitFeedback,
    getFeedbacks,
    getOrderFeedback,
    getAllFeedbacks,
    approveFeedback,
    deleteFeedback
};