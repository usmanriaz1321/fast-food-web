const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['register', 'forgot-password'],
        default: 'forgot-password'
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => Date.now() + 5 * 60 * 1000 // 5 minutes
    }
}, {
    timestamps: true
});

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);