const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://fast-food-web-sigma.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());

// ===== CONNECT TO MONGODB =====
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        console.log('✅ Using cached connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
        };

        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('✅ MongoDB Connected');
                return mongoose;
            })
            .catch((err) => {
                console.error('❌ MongoDB Error:', err.message);
                cached.promise = null;
                throw err;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

// ===== ROUTES =====
app.get('/', async (req, res) => {
    await connectDB();
    res.json({ 
        status: 1, 
        message: '🚀 API is running',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.get('/api/test', async (req, res) => {
    await connectDB();
    res.json({ status: 1, message: '✅ API test successful' });
});

// ========== ROUTES ==========
// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));

//Feadback
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// User Routes
app.use('/api/user', require('./routes/userRoutes'));

// Menu Routes
app.use('/api/menu', require('./routes/menuRoutes'));

// Deal Routes
app.use('/api/deals', require('./routes/dealRoutes'));

// Order Routes
app.use('/api/orders', require('./routes/orderRoutes'));

// Cart Routes
app.use('/api/cart', require('./routes/cartRoutes'));

// Admin Routes
app.use('/api/admin', require('./routes/adminRoutes'));

// Upload Routes
app.use('/api/upload', require('./routes/uploadRoutes'));

//category Routes
app.use('/api/categories', require('./routes/categoryRoutes'));

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
    res.status(404).json({ status: 0, message: 'Route not found' });
});

// ===== EXPORT =====
module.exports = app;

// ===== LOCAL SERVER =====
if (require.main === module) {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}