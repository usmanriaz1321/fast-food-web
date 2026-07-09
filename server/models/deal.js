const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    items: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: '🍕'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    category: {
        type: String,
        enum: ['classic', 'family', 'special'],
        default: 'classic'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Deal', dealSchema);