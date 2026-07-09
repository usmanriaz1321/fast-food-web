// server/models/MenuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Pizza', 'Burgers', 'Shawarma', 'Pasta', 'Sandwiches', 'Sides', 'Salads', 'Drinks','Pratha Rolls'],
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    // ✅ CHANGE: sizes as array of objects with name and price
    sizes: [{
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    image: {
        type: String,
        default: '🍕'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    isPopular: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// ✅ Use mongoose.models to check if model exists
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;