const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== ROUTES ==========
// Auth Routes
app.use('/api/auth', require('./routes/web/authRoutes'));

//Feadback
app.use('/api/feedback', require('./routes/web/feedbackRoutes'));

// User Routes
app.use('/api/user', require('./routes/web/userRoutes'));

// Menu Routes
app.use('/api/menu', require('./routes/web/menuRoutes'));

// Deal Routes
app.use('/api/deals', require('./routes/web/dealRoutes'));

// Order Routes
app.use('/api/orders', require('./routes/web/orderRoutes'));

// Cart Routes
app.use('/api/cart', require('./routes/web/cartRoutes'));

// Admin Routes
app.use('/api/admin', require('./routes/admin/adminRoutes'));

// Upload Routes
app.use('/api/upload', require('./routes/web/uploadRoutes'));

//category Routes
app.use('/api/categories', require('./routes/web/categoryRoutes'));

// ========== DATABASE CONNECTION ==========
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 0,
        message: 'Something went wrong!',
        error: err.message
    });
});

// ========== 404 ==========
app.use((req, res) => {
    res.status(404).json({
        status: 0,
        message: 'Route not found'
    });
});

module.exports = app;