const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    icon: {
        type: String,
        default: '🍕'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    imageFile: {
        type: String,
        default: ''
    },
    count: {
        type: String,
        default: '0 items'
    },
    color: {
        type: String,
        default: '#FBE3B8'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);