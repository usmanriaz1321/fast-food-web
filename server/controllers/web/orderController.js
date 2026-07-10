const Order = require('../../models/order');
const Cart = require('../../models/cart');
const User=require('../../models/user');

// ========== PLACE ORDER ==========
const placeOrder = async (req, res) => {
    try {
        const { address, city, phone, paymentMethod, orderNotes } = req.body;
        
        const user=await User.findById(req.userId);
        if(user.status=='inactive' || user.status=='blocked'){
            return res.status(400).json({
                status:707,
                message:"User is inactive or blocked"
            })
        }

        // Get cart
        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                status: 0,
                message: 'Cart is empty'
            });
        }

        const order = new Order({
            userId: req.userId,
            items: cart.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            })),
            total: cart.subtotal,
            subtotal: cart.subtotal,
            address,
            city,
            phone,
            paymentMethod: paymentMethod || 'COD',
            orderNotes: orderNotes || ''
        });

        await order.save();

        // Clear cart
        cart.items = [];
        cart.subtotal = 0;
        await cart.save();

        res.status(201).json({
            status: 1,
            message: 'Order placed successfully!',
            data: {
                orderId: order._id,
                order: order
            }
        });

    } catch (error) {
        console.error('Place Order Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET USER ORDERS ==========
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 1,
            data: orders
        });

    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET SINGLE ORDER ==========
const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            userId: req.userId
        });

        if (!order) {
            return res.status(404).json({
                status: 0,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            status: 1,
            data: order
        });

    } catch (error) {
        console.error('Get Single Order Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== UPDATE ORDER STATUS (Admin) ==========
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                status: 0,
                message: 'Order not found'
            });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            status: 1,
            message: 'Order status updated!',
            data: order
        });

    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

module.exports = {
    placeOrder,
    getOrders,
    getSingleOrder,
    updateOrderStatus
};