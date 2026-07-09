import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { cartAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Cart = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoApplied, setPromoApplied] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState(0);

    // ✅ Fetch cart on page load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart();
        } else {
            setLoading(false);
            toast.info('Please login to view your cart', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        }
    }, []);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await cartAPI.get();
            if (response.data.status === 1) {
                const cart = response.data.data;
                setCartId(cart._id);
                setCartItems(cart.items || []);
                setDeliveryFee(cart.deliveryFee || 0);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.info('Please login to view your cart', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            } else {
                toast.error('Failed to load cart');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeItem(itemId);
            return;
        }

        try {
            const response = await cartAPI.update({
                itemId: itemId,
                quantity: newQuantity
            });
            if (response.data.status === 1) {
                setCartItems(response.data.data?.items || []);
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (error) {
            toast.error('Failed to update quantity');
        }
    };

    const removeItem = async (itemId) => {
        try {
            const response = await cartAPI.remove(itemId);
            if (response.data.status === 1) {
                setCartItems(response.data.data?.items || []);
                window.dispatchEvent(new Event('cartUpdated'));
                toast.info('🗑️ Item removed from cart.', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "colored",
                });
            }
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const applyPromo = async () => {
        if (!promoCode) {
            toast.warning('Please enter a promo code');
            return;
        }

        // Simulate promo validation (backend would handle this)
        if (promoCode.toUpperCase() === 'FAMILY10') {
            setDiscount(10);
            setPromoApplied(true);
            toast.success('🎉 Promo code applied! 10% off!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } else if (promoCode.toUpperCase() === 'WELCOME') {
            setDiscount(15);
            setPromoApplied(true);
            toast.success('🎉 Promo code applied! 15% off!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } else {
            toast.warning('⚠️ Invalid promo code.', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        }
    };

    // ✅ Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFeeAmount = subtotal > 600 ? 0 : 100;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal + deliveryFeeAmount - discountAmount;

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.warning('🛒 Your cart is empty!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            return;
        }
        toast.success('🔄 Redirecting to checkout...', {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
        });
        setTimeout(() => navigate('/checkout'), 1500);
    };

    // ✅ Render item details with size info
    const renderItemDetails = (item) => {
        let details = [];
        
        if (item.options) {
            try {
                const parsedOptions = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
                if (parsedOptions.size) {
                    details.push(`Size: ${parsedOptions.size}`);
                }
                if (parsedOptions.deal) {
                    details.push('Deal');
                }
            } catch (e) {
                details.push(item.options);
            }
        }
        
        if (item.size) {
            details.push(`Size: ${item.size}`);
        }
        
        return details.length > 0 ? details.join(' • ') : null;
    };

    // ✅ Render item image with size badge
    const renderItemImage = (item) => {
        const hasSize = item.size || (item.options && JSON.parse(item.options || '{}').size);
        
        return (
            <div className="position-relative">
                <div className="cart-item-image">
                    {item.image && item.image.startsWith('http') ? (
                        <img 
                            src={item.image} 
                            alt={item.name}
                            className="cart-item-img"
                        />
                    ) : (
                        <span className="cart-item-emoji">{item.image || '🍕'}</span>
                    )}
                </div>
                {hasSize && (
                    <Badge className="cart-size-badge">Size</Badge>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <Spinner animation="border" variant="danger" style={{ width: '60px', height: '60px' }} />
                </div>
                <Footer />
            </>
        );
    }

    if (cartItems.length === 0) {
        return (
            <>
                <ToastContainer />
                <Navbar />
                <section className="cart-section py-5">
                    <Container>
                        <div className="text-center py-5">
                            <div className="empty-cart-icon">🛒</div>
                            <h2 className="empty-cart-title">Your Cart is Empty</h2>
                            <p className="empty-cart-text">Looks like you haven't added anything yet.</p>
                            <Button 
                                className="empty-cart-btn"
                                onClick={() => navigate('/menu')}
                            >
                                Browse Menu →
                            </Button>
                        </div>
                    </Container>
                </section>
                <Footer />
            </>
        );
    }

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="cart-section py-4">
                <Container>
                    <div className="cart-header">
                        <h2 className="cart-title">🛒 Your Cart</h2>
                        <Badge className="cart-count-badge">
                            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                        </Badge>
                    </div>

                    <Row className="g-4">
                        {/* Cart Items */}
                        <Col lg={8}>
                            <Card className="cart-items-card">
                                <Card.Body>
                                    {cartItems.map((item, index) => {
                                        const itemId = item.itemId || item._id;
                                        const itemPrice = item.price || 0;
                                        const itemQuantity = item.quantity || 1;
                                        const itemTotal = itemPrice * itemQuantity;
                                        const itemDetails = renderItemDetails(item);
                                        
                                        return (
                                            <div 
                                                key={itemId || index} 
                                                className={`cart-item ${index < cartItems.length - 1 ? 'border-bottom' : ''}`}
                                            >
                                                {/* Item Image with Size Badge */}
                                                {renderItemImage(item)}
                                                
                                                {/* Item Details */}
                                                <div className="cart-item-details">
                                                    <div className="cart-item-header">
                                                        <div>
                                                            <h6 className="cart-item-name">{item.name}</h6>
                                                            {itemDetails && (
                                                                <div className="cart-item-meta">
                                                                    <Badge className="cart-item-badge">
                                                                        {itemDetails}
                                                                    </Badge>
                                                                    <span className="cart-item-price-label">
                                                                        Rs. {itemPrice.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {!itemDetails && (
                                                                <span className="cart-item-price-label">
                                                                    Rs. {itemPrice.toLocaleString()} each
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            className="cart-remove-btn"
                                                            onClick={() => removeItem(itemId)}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="cart-item-actions">
                                                        <div className="cart-qty-controls">
                                                            <Button 
                                                                className="cart-qty-btn"
                                                                onClick={() => updateQuantity(itemId, itemQuantity - 1)}
                                                            >
                                                                −
                                                            </Button>
                                                            <span className="cart-qty-number">
                                                                {itemQuantity}
                                                            </span>
                                                            <Button 
                                                                className="cart-qty-btn"
                                                                onClick={() => updateQuantity(itemId, itemQuantity + 1)}
                                                            >
                                                                +
                                                            </Button>
                                                        </div>
                                                        <span className="cart-item-total">
                                                            Rs. {itemTotal.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Order Summary */}
                        <Col lg={4}>
                            <Card className="cart-summary-card">
                                <Card.Body>
                                    <h5 className="cart-summary-title">Order Summary</h5>

                                    <div className="cart-summary-row">
                                        <span className="text-secondary">Subtotal</span>
                                        <span className="fw-semibold">Rs. {subtotal.toLocaleString()}</span>
                                    </div>

                                    <div className="cart-summary-row">
                                        <span className="text-secondary">Delivery Fee</span>
                                        <span className="fw-semibold">
                                            {deliveryFeeAmount === 0 ? 'Free' : `Rs. ${deliveryFeeAmount}`}
                                        </span>
                                    </div>

                                    {discount > 0 && (
                                        <div className="cart-summary-discount">
                                            <span>Discount ({discount}%)</span>
                                            <span>- Rs. {discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <hr className="cart-summary-divider" />

                                    <div className="cart-summary-total">
                                        <span className="fw-bold">Total</span>
                                        <span className="cart-total-amount">
                                            Rs. {total.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Free Delivery Info */}
                                    {subtotal < 600 && subtotal > 0 && (
                                        <div className="cart-free-delivery-info">
                                            💡 Add Rs. {(600 - subtotal).toLocaleString()} more for free delivery!
                                        </div>
                                    )}
                                    {subtotal >= 600 && subtotal > 0 && (
                                        <div className="cart-free-delivery-success">
                                            ✅ Free delivery applied!
                                        </div>
                                    )}

                                    {/* Promo Code */}
                                    <div className="cart-promo-section">
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                placeholder="Promo code"
                                                className="cart-promo-input"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                disabled={promoApplied}
                                            />
                                            <Button 
                                                className="cart-promo-btn"
                                                onClick={applyPromo}
                                                disabled={promoApplied || !promoCode}
                                            >
                                                Apply
                                            </Button>
                                        </InputGroup>
                                        {promoApplied && (
                                            <small className="cart-promo-success">✅ Promo code applied!</small>
                                        )}
                                    </div>

                                    <Button 
                                        className="cart-checkout-btn"
                                        onClick={handleCheckout}
                                        disabled={cartItems.length === 0}
                                    >
                                        Proceed to Checkout →
                                    </Button>

                                    <div className="cart-continue-shopping">
                                        <Link to="/menu" className="cart-continue-link">
                                            ← Continue Shopping
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
            <Footer />

            <style>{`
                /* ===== CART SECTION ===== */
                .cart-section {
                    background: var(--light);
                    min-height: 80vh;
                    padding-bottom: 40px;
                }

                /* ===== CART HEADER ===== */
                .cart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .cart-title {
                    font-weight: 700;
                    margin-bottom: 0;
                    color: var(--text-primary);
                    font-size: var(--font-2xl);
                }

                .cart-count-badge {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    padding: 8px 16px;
                    border-radius: var(--radius-full);
                    font-weight: 600;
                }

                /* ===== CART ITEMS CARD ===== */
                .cart-items-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                /* ===== CART ITEM ===== */
                .cart-item {
                    display: flex;
                    align-items: flex-start;
                    padding: 16px 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }

                .cart-item:last-child {
                    border-bottom: none;
                }

                /* ===== ITEM IMAGE ===== */
                .cart-item-image {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 70px;
                    height: 70px;
                    background: var(--light-dark);
                    border-radius: var(--radius-md);
                    font-size: 32px;
                    flex-shrink: 0;
                    overflow: hidden;
                    position: relative;
                    margin-right: 12px;
                }

                .cart-item-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .cart-item-emoji {
                    font-size: 32px;
                }

                .cart-size-badge {
                    position: absolute;
                    top: -5px;
                    right: 5px;
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    font-size: 8px;
                    padding: 2px 6px;
                    border-radius: var(--radius-full);
                }

                /* ===== ITEM DETAILS ===== */
                .cart-item-details {
                    flex-grow: 1;
                }

                .cart-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .cart-item-name {
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .cart-item-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                    flex-wrap: wrap;
                }

                .cart-item-badge {
                    background: var(--light-dark) !important;
                    color: var(--text-primary) !important;
                    font-weight: 400;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-xs);
                }

                .cart-item-price-label {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .cart-remove-btn {
                    background: transparent !important;
                    border: none !important;
                    color: var(--text-muted) !important;
                    width: 30px;
                    height: 30px;
                    padding: 0;
                    border-radius: 50%;
                    transition: all var(--transition-normal);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .cart-remove-btn:hover {
                    background: var(--danger-light) !important;
                    color: var(--danger) !important;
                    transform: scale(1.1);
                }

                /* ===== ITEM ACTIONS ===== */
                .cart-item-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                }

                .cart-qty-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .cart-qty-btn {
                    background: var(--light-dark) !important;
                    border: none !important;
                    color: var(--text-primary) !important;
                    width: 30px;
                    height: 30px;
                    padding: 0;
                    border-radius: 50%;
                    transition: all var(--transition-normal);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .cart-qty-btn:hover {
                    background: var(--primary) !important;
                    color: white !important;
                    transform: scale(1.1);
                }

                .cart-qty-number {
                    font-weight: 700;
                    min-width: 30px;
                    text-align: center;
                    color: var(--text-primary);
                }

                .cart-item-total {
                    font-weight: 700;
                    color: var(--primary);
                    font-size: var(--font-md);
                }

                /* ===== SUMMARY CARD ===== */
                .cart-summary-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                    position: sticky;
                    top: 20px;
                }

                .cart-summary-title {
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: var(--text-primary);
                }

                .cart-summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    color: var(--text-secondary);
                }

                .cart-summary-discount {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    color: var(--success);
                }

                .cart-summary-divider {
                    border-color: rgba(0, 0, 0, 0.05);
                    margin: 12px 0;
                }

                .cart-summary-total {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .cart-total-amount {
                    color: var(--primary);
                    font-size: var(--font-xl);
                }

                /* ===== FREE DELIVERY ===== */
                .cart-free-delivery-info {
                    background: var(--info-light);
                    color: var(--info);
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    font-size: var(--font-xs);
                    margin-bottom: 12px;
                }

                .cart-free-delivery-success {
                    background: var(--success-light);
                    color: var(--success);
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    font-size: var(--font-xs);
                    margin-bottom: 12px;
                }

                /* ===== PROMO ===== */
                .cart-promo-section {
                    margin-bottom: 16px;
                }

                .cart-promo-input {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-full) 0 0 var(--radius-full) !important;
                    padding: 10px 16px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    transition: all var(--transition-normal);
                }

                .cart-promo-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .cart-promo-input:disabled {
                    opacity: 0.6;
                }

                .cart-promo-btn {
                    background: var(--light-dark) !important;
                    border: 2px solid var(--light-dark) !important;
                    color: var(--text-primary) !important;
                    border-radius: 0 var(--radius-full) var(--radius-full) 0 !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .cart-promo-btn:hover:not(:disabled) {
                    background: var(--primary) !important;
                    border-color: var(--primary) !important;
                    color: white !important;
                }

                .cart-promo-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .cart-promo-success {
                    color: var(--success);
                    display: block;
                    margin-top: 4px;
                }

                /* ===== CHECKOUT BUTTON ===== */
                .cart-checkout-btn {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    width: 100%;
                    padding: 16px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .cart-checkout-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .cart-checkout-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== CONTINUE SHOPPING ===== */
                .cart-continue-shopping {
                    text-align: center;
                    margin-top: 12px;
                }

                .cart-continue-link {
                    color: var(--text-secondary) !important;
                    text-decoration: none !important;
                    font-size: var(--font-sm);
                    transition: all var(--transition-normal);
                }

                .cart-continue-link:hover {
                    color: var(--primary) !important;
                }

                /* ===== EMPTY CART ===== */
                .empty-cart-icon {
                    font-size: 72px;
                    margin-bottom: 16px;
                }

                .empty-cart-title {
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }

                .empty-cart-text {
                    color: var(--text-secondary);
                    margin-bottom: 20px;
                }

                .empty-cart-btn {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    padding: 12px 40px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .empty-cart-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .cart-items-card,
                [data-theme="dark"] .cart-summary-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .cart-item {
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .cart-item-image {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .cart-promo-input {
                    background: var(--dark-light) !important;
                    border-color: var(--dark-light) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .cart-promo-btn {
                    background: var(--dark-light) !important;
                    border-color: var(--dark-light) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .cart-qty-btn {
                    background: var(--dark-light) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .cart-summary-divider {
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .cart-item-badge {
                    background: var(--dark-light) !important;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .cart-summary-card {
                        position: relative;
                        top: 0 !important;
                    }
                }

                @media (max-width: 768px) {
                    .cart-section {
                        padding: 15px 0 30px 0;
                    }

                    .cart-title {
                        font-size: var(--font-xl);
                    }

                    .cart-item {
                        flex-direction: column;
                        align-items: stretch !important;
                    }

                    .cart-item-image {
                        margin-right: 0 !important;
                        margin-bottom: 10px;
                        width: 60px;
                        height: 60px;
                    }

                    .cart-item-header {
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .cart-item-actions {
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .cart-total-amount {
                        font-size: var(--font-lg);
                    }

                    .empty-cart-icon {
                        font-size: 56px;
                    }
                }

                @media (max-width: 576px) {
                    .cart-item-image {
                        width: 50px;
                        height: 50px;
                        font-size: 24px;
                    }

                    .cart-item-emoji {
                        font-size: 24px;
                    }

                    .cart-qty-btn {
                        width: 26px;
                        height: 26px;
                        font-size: var(--font-sm);
                    }

                    .cart-item-total {
                        font-size: var(--font-sm);
                    }

                    .cart-checkout-btn {
                        padding: 12px;
                        font-size: var(--font-sm);
                    }

                    .cart-total-amount {
                        font-size: var(--font-md);
                    }

                    .empty-cart-icon {
                        font-size: 48px;
                    }

                    .empty-cart-title {
                        font-size: var(--font-xl);
                    }
                }
            `}</style>
        </>
    );
};

export default Cart;