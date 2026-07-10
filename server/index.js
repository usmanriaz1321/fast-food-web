const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://fast-food-web-sigma.vercel.app',
        'https://*.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== TEST ROUTE =====
app.get('/', (req, res) => {
    res.json({
        status: 1,
        message: '🚀 API is running on Vercel!',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    res.json({
        status: 1,
        server: 'running',
        database: statusMap[dbStatus] || 'unknown'
    });
});

// ===== ROUTES =====
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        status: 0,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

// ===== 404 =====
app.use((req, res) => {
    res.status(404).json({
        status: 0,
        message: 'Route not found'
    });
});

// ===== ✅ EXPORT FOR VERCEL =====
module.exports = app;

// ===== LOCAL SERVER =====
if (require.main === module) {
    const PORT = process.env.PORT || 8000;
    
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
}