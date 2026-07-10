const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

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

app.get('/api/test', (req, res) => {
    res.json({
        status: 1,
        message: '✅ API test successful'
    });
});

// ===== 404 =====
app.use((req, res) => {
    res.status(404).json({
        status: 0,
        message: 'Route not found'
    });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        status: 0,
        message: 'Internal server error'
    });
});

// ===== ✅ EXPORT FOR VERCEL =====
module.exports = app;

// ===== LOCAL SERVER =====
if (require.main === module) {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🔗 http://localhost:${PORT}`);
    });
}