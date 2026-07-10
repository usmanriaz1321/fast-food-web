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

// ===== TEST ROUTES =====
app.get('/', (req, res) => {
    res.json({
        status: 1,
        message: '🚀 API is running on Vercel!',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 1,
        server: 'running',
        message: '✅ Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// ===== ROUTES WITH ERROR HANDLING =====
const loadRoute = (path, routeFile) => {
    try {
        app.use(path, require(routeFile));
        console.log(`✅ Route loaded: ${path}`);
    } catch (err) {
        console.error(`❌ Failed to load ${path}:`, err.message);
        // Create a fallback route
        app.use(path, (req, res) => {
            res.status(503).json({
                status: 0,
                message: `Route ${path} is currently unavailable`,
                error: err.message
            });
        });
    }
};

// Load all routes
loadRoute('/api/auth', './routes/authRoutes');
loadRoute('/api/feedback', './routes/feedbackRoutes');
loadRoute('/api/user', './routes/userRoutes');
loadRoute('/api/menu', './routes/menuRoutes');
loadRoute('/api/deals', './routes/dealRoutes');
loadRoute('/api/orders', './routes/orderRoutes');
loadRoute('/api/cart', './routes/cartRoutes');
loadRoute('/api/admin', './routes/adminRoutes');
loadRoute('/api/upload', './routes/uploadRoutes');
loadRoute('/api/categories', './routes/categoryRoutes');

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        status: 0,
        message: 'Internal server error',
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