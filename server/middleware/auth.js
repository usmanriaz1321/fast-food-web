const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 0,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                status: 0,
                message: 'User not found'
            });
        }
        req.userId = decoded.userId;
        // req.userRole = decoded.role;
        req.user = user;  // ✅ Attach full user object

        next();

    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(401).json({
            status: 0,
            message: 'Invalid or expired token.'
        });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 0,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'admin') {
            return res.status(403).json({
                status: 0,
                message: 'Access denied. Admin only.'
            });
        }

        req.userId = decoded.userId;
        req.userRole = decoded.role;

        next();

    } catch (error) {
        console.error('Admin Auth Error:', error);
        return res.status(401).json({
            status: 0,
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = { auth, isAdmin };