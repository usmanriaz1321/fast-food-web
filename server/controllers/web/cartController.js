const Cart = require('../../models/Cart');

// ========== ADD TO CART ==========
const addToCart = async (req, res) => {
    try {
        const { itemId, quantity, name, price, image, options } = req.body;

        console.log('📦 Add to Cart Request:', req.body);

        // ✅ Validate required fields
        if (!itemId) {
            return res.status(400).json({
                status: 0,
                message: 'Item ID is required'
            });
        }

        // ✅ Find or create cart
        let cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            cart = new Cart({
                userId: req.userId,
                items: [],
                subtotal: 0
            });
        }

        // ✅ Check if item already exists
        const existingItemIndex = cart.items.findIndex(
            item => item.itemId && item.itemId.toString() === itemId
        );

        if (existingItemIndex !== -1) {
            cart.items[existingItemIndex].quantity += quantity || 1;
        } else {
            cart.items.push({
                itemId: itemId,
                name: name || 'Item',
                quantity: quantity || 1,
                price: price || 0,
                image: image || '🍕',
                options: options || ''
            });
        }

        // ✅ Recalculate subtotal
        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        await cart.save();

        res.status(200).json({
            status: 1,
            message: 'Item added to cart!',
            data: cart
        });

    } catch (error) {
        console.error('❌ Add to Cart Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error: ' + error.message
        });
    }
};

// ========== GET CART ==========
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            cart = new Cart({
                userId: req.userId,
                items: [],
                subtotal: 0
            });
            await cart.save();
        }

        res.status(200).json({
            status: 1,
            data: cart
        });

    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== UPDATE CART ITEM ==========
const updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            return res.status(404).json({
                status: 0,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.itemId === itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                status: 0,
                message: 'Item not found in cart'
            });
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        await cart.save();

        res.status(200).json({
            status: 1,
            message: 'Cart updated!',
            data: cart
        });

    } catch (error) {
        console.error('Update Cart Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== REMOVE FROM CART ==========
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            return res.status(404).json({
                status: 0,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(
            item => item.itemId !== itemId
        );

        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        await cart.save();

        res.status(200).json({
            status: 1,
            message: 'Item removed from cart!',
            data: cart
        });

    } catch (error) {
        console.error('Remove from Cart Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== CLEAR CART ==========
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            return res.status(404).json({
                status: 0,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        cart.subtotal = 0;

        await cart.save();

        res.status(200).json({
            status: 1,
            message: 'Cart cleared!',
            data: cart
        });

    } catch (error) {
        console.error('Clear Cart Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};