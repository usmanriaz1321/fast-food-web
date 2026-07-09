import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { Link, useNavigate} from 'react-router-dom';
import { toast , ToastContainer} from 'react-toastify';
import { cartAPI, orderAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Checkout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cartData, setCartData] = useState({
        items: [],
        subtotal: 0,
        total: 0,
        deliveryFee: 0
    });

    // ✅ Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    const [formData, setFormData] = useState({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || 'Harnoli, Tehsil Piplan, Mianwali',
        city: userData.city || 'Harnoli',
        paymentMethod: 'COD',
        notes: ''
    });

    // ✅ Fetch cart data on page load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCartData();
    }, []);

    const fetchCartData = async () => {
        setLoading(true);
        try {
            const response = await cartAPI.get();
            if (response.data.status === 1) {
                const cart = response.data.data;
                const items = cart.items || [];
                const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
                const deliveryFee = subtotal > 600 ? 0 : 100;
                setCartData({
                    items: items,
                    subtotal: subtotal,
                    deliveryFee: deliveryFee,
                    total: subtotal + deliveryFee
                });
            }
        } catch (error) {
            console.error('Cart Error:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                toast.error('Failed to load cart');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // ✅ Check if digital wallet is selected (coming soon)
        if (formData.paymentMethod === 'Wallet') {
            toast.info('💳 Digital wallet payments coming soon! Please select Cash on Delivery.', {
                position: "top-right",
                autoClose: 4000,
                theme: "colored",
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const orderData = {
                address: formData.address,
                city: formData.city,
                phone: formData.phone,
                paymentMethod: formData.paymentMethod,
                orderNotes: formData.notes
            };

            const response = await orderAPI.place(orderData);
            if(response.data.status === 707){
                toast.danger(`Your account is inactive so can't place order `);
                return;
            }
            
            if (response.data.status === 1) {
                const order = response.data.data.order;
                
                toast.success('🎉 Order placed successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });

                // ✅ Clear cart locally
                setCartData({
                    items: [],
                    subtotal: 0,
                    deliveryFee: 0,
                    total: 0
                });

                // ✅ Navigate to order confirmation
                setTimeout(() => {
                    navigate('/order-confirmation', {
                        state: {
                            orderId: order._id,
                            orderData: {
                                ...order,
                                items: order.items || [],
                                total: order.total || 0,
                                date: new Date(order.createdAt).toLocaleDateString()
                            }
                        }
                    });
                }, 1500);
            }
        } catch (error) {
            console.error('Order Error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order. Please try again.', {
                position: "top-right",
                autoClose: 4000,
                theme: "colored",
            });
        } finally {
            setIsSubmitting(false);
        }
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

    if (cartData.items.length === 0) {
        return (
            <>
                <ToastContainer />
                <Navbar />
                <section className="checkout-section py-4">
                    <Container>
                        <div className="text-center py-5">
                            <div className="empty-cart-icon">🛒</div>
                            <h2 className="empty-cart-title">Your Cart is Empty</h2>
                            <p className="empty-cart-text">Add some items before checking out.</p>
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
            <section className="checkout-section py-4">
                <Container>
                    <h2 className="checkout-title">📋 Checkout</h2>

                    <Row className="g-4">
                        {/* Checkout Form */}
                        <Col lg={7}>
                            <Card className="checkout-form-card">
                                <Card.Body className="p-4">
                                    <h5 className="checkout-section-title">Delivery Details</h5>
                                    
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="form-label-custom">Full Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={isSubmitting}
                                                        className="form-control-custom"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="form-label-custom">Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={isSubmitting}
                                                        className="form-control-custom"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="form-label-custom">Phone</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={isSubmitting}
                                                        className="form-control-custom"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="form-label-custom">City</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={isSubmitting}
                                                        className="form-control-custom"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="form-label-custom">Delivery Address</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        name="address"
                                                        rows="2"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={isSubmitting}
                                                        className="form-control-custom"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="form-label-custom">Order Notes (Optional)</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        name="notes"
                                                        rows="2"
                                                        placeholder="Any special instructions..."
                                                        value={formData.notes}
                                                        onChange={handleChange}
                                                        disabled={isSubmitting}
                                                        className="form-control-custom"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Payment Methods */}
                                        <h5 className="checkout-section-title mt-4">Payment Method</h5>
                                        <div className="payment-methods-container">
                                            <Form.Check
                                                type="radio"
                                                name="paymentMethod"
                                                value="COD"
                                                label="Cash on Delivery"
                                                checked={formData.paymentMethod === 'COD'}
                                                onChange={handleChange}
                                                className="payment-method-option"
                                            />
                                            <Form.Check
                                                type="radio"
                                                name="paymentMethod"
                                                value="Wallet"
                                                label={
                                                    <span>
                                                        Digital Wallet <Badge className="coming-soon-badge">Coming Soon</Badge>
                                                    </span>
                                                }
                                                checked={formData.paymentMethod === 'Wallet'}
                                                onChange={handleChange}
                                                className="payment-method-option"
                                                disabled={true}
                                            />
                                        </div>

                                        {/* Show coming soon message if Wallet selected */}
                                        {formData.paymentMethod === 'Wallet' && (
                                            <Alert variant="info" className="wallet-alert">
                                                💳 Digital wallet payments are coming soon! Please select "Cash on Delivery" to place your order.
                                            </Alert>
                                        )}

                                        <Button 
                                            type="submit" 
                                            className="checkout-submit-btn"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Processing...' : 'Place Order →'}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Order Summary */}
                        <Col lg={5}>
                            <Card className="checkout-summary-card">
                                <Card.Body className="p-4">
                                    <h5 className="checkout-section-title">📝 Order Summary</h5>
                                    
                                    {cartData.items.map((item, idx) => (
                                        <div key={idx} className="order-summary-item">
                                            <div>
                                                <span className="order-item-qty">{item.quantity || 1}x</span>
                                                <span className="order-item-name">{item.name}</span>
                                            </div>
                                            <span className="order-item-price">Rs. {(item.price * (item.quantity || 1)).toLocaleString()}</span>
                                        </div>
                                    ))}

                                    <hr className="checkout-divider" />

                                    <div className="order-summary-row">
                                        <span className="text-secondary">Subtotal</span>
                                        <span>Rs. {cartData.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="order-summary-row">
                                        <span className="text-secondary">Delivery Fee</span>
                                        <span>{cartData.deliveryFee === 0 ? 'Free' : `Rs. ${cartData.deliveryFee}`}</span>
                                    </div>

                                    <hr className="checkout-divider" />

                                    <div className="order-summary-total">
                                        <span className="fw-bold">Total</span>
                                        <span className="order-total-amount">
                                            Rs. {cartData.total.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="delivery-info-box">
                                        <p className="delivery-info-text">
                                            🚚 Free delivery on orders above Rs. 600
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Back to Cart */}
                            <div className="text-center mt-3">
                                <Link to="/cart" className="back-to-cart-link">
                                    ← Back to Cart
                                </Link>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
            <Footer />

            <style>{`
                /* ===== CHECKOUT SECTION ===== */
                .checkout-section {
                    background: var(--light);
                    min-height: 80vh;
                    padding: 20px 0 40px 0;
                }

                /* ===== TITLE ===== */
                .checkout-title {
                    font-weight: 700;
                    margin-bottom: 24px;
                    color: var(--text-primary);
                    font-size: var(--font-2xl);
                }

                /* ===== CARDS ===== */
                .checkout-form-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                .checkout-summary-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                /* ===== SECTION TITLE ===== */
                .checkout-section-title {
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: var(--text-primary);
                    font-size: var(--font-lg);
                }

                /* ===== FORM LABEL ===== */
                .form-label-custom {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: var(--font-sm);
                }

                /* ===== FORM CONTROL ===== */
                .form-control-custom {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    transition: all var(--transition-normal);
                }

                .form-control-custom:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .form-control-custom:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== PAYMENT METHODS ===== */
                .payment-methods-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .payment-method-option {
                    flex: 1;
                    min-width: 150px;
                    padding: 16px 20px;
                    border: 2px solid var(--light-dark);
                    border-radius: var(--radius-md);
                    transition: all var(--transition-normal);
                    cursor: pointer;
                    background: var(--light-card);
                }

                .payment-method-option:hover {
                    border-color: var(--primary);
                    background: var(--light-dark);
                }

                .payment-method-option .form-check-input:checked {
                    background-color: var(--primary);
                    border-color: var(--primary);
                }

                .payment-method-option .form-check-input:checked ~ .form-check-label {
                    color: var(--primary);
                }

                .payment-method-option.disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .payment-method-option .form-check-input:disabled {
                    cursor: not-allowed;
                }

                /* ===== COMING SOON BADGE ===== */
                .coming-soon-badge {
                    background: var(--secondary-gradient) !important;
                    color: var(--dark) !important;
                    font-weight: 600;
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-xs);
                }

                /* ===== WALLET ALERT ===== */
                .wallet-alert {
                    background: var(--info-light) !important;
                    color: var(--info) !important;
                    border: none !important;
                    border-radius: var(--radius-md);
                    padding: 12px 16px;
                    margin-top: 12px;
                    font-size: var(--font-sm);
                }

                /* ===== SUBMIT BUTTON ===== */
                .checkout-submit-btn {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    width: 100%;
                    padding: 14px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    font-size: var(--font-md);
                    margin-top: 20px;
                    transition: all var(--transition-normal);
                }

                .checkout-submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .checkout-submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== ORDER SUMMARY ===== */
                .order-summary-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }

                .order-summary-item:last-child {
                    border-bottom: none;
                }

                .order-item-qty {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .order-item-name {
                    margin-left: 8px;
                    color: var(--text-secondary);
                }

                .order-item-price {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .order-summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    color: var(--text-secondary);
                }

                .checkout-divider {
                    border-color: rgba(0, 0, 0, 0.05);
                    margin: 12px 0;
                }

                .order-summary-total {
                    display: flex;
                    justify-content: space-between;
                    font-weight: 700;
                    font-size: var(--font-lg);
                    color: var(--text-primary);
                }

                .order-total-amount {
                    color: var(--primary);
                }

                /* ===== DELIVERY INFO ===== */
                .delivery-info-box {
                    margin-top: 16px;
                    padding: 12px 16px;
                    background: var(--light-dark);
                    border-radius: var(--radius-md);
                }

                .delivery-info-text {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 0;
                }

                /* ===== BACK TO CART ===== */
                .back-to-cart-link {
                    color: var(--text-secondary) !important;
                    text-decoration: none !important;
                    font-size: var(--font-sm);
                    transition: all var(--transition-normal);
                }

                .back-to-cart-link:hover {
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
                [data-theme="dark"] .checkout-form-card,
                [data-theme="dark"] .checkout-summary-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .payment-method-option {
                    background: var(--dark-card);
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .payment-method-option:hover {
                    background: var(--dark-light);
                    border-color: var(--primary);
                }

                [data-theme="dark"] .form-control-custom {
                    background: var(--dark-card) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .form-control-custom:focus {
                    border-color: var(--primary) !important;
                }

                [data-theme="dark"] .order-summary-item {
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .checkout-divider {
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .delivery-info-box {
                    background: var(--dark-light);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .checkout-section {
                        padding: 15px 0 30px 0;
                    }

                    .checkout-title {
                        font-size: var(--font-xl);
                    }

                    .checkout-form-card .p-4,
                    .checkout-summary-card .p-4 {
                        padding: 16px !important;
                    }

                    .payment-methods-container {
                        flex-direction: column;
                    }

                    .payment-method-option {
                        min-width: auto;
                    }

                    .order-summary-total {
                        font-size: var(--font-md);
                    }

                    .empty-cart-icon {
                        font-size: 56px;
                    }
                }

                @media (max-width: 576px) {
                    .checkout-section {
                        padding: 10px 0 20px 0;
                    }

                    .checkout-title {
                        font-size: var(--font-lg);
                    }

                    .checkout-section-title {
                        font-size: var(--font-md);
                    }

                    .checkout-submit-btn {
                        font-size: var(--font-sm);
                        padding: 12px;
                    }

                    .form-label-custom {
                        font-size: var(--font-xs);
                    }

                    .form-control-custom {
                        font-size: var(--font-sm);
                        padding: 8px 12px !important;
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

export default Checkout;