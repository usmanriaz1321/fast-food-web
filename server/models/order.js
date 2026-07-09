const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        name: String,
        quantity: Number,
        price: Number,
        image: String
    }],
    total: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Preparing', 'On Delivery', 'Delivered', 'Cancelled','CancelledByUser'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Card', 'Wallet'],
        default: 'COD'
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    orderNotes: {
        type: String,
        default: ''
    },
    estimatedTime: {
        type: String,
        default: '30-40 min'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);