import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { orderAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    
    // ✅ Feedback states
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ rating: 0, review: '' });

    // ✅ Get order data from navigation state or fetch from API
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const stateOrder = location.state?.orderData;
        const orderId = location.state?.orderId;

        if (stateOrder) {
            setOrder({
                id: stateOrder._id || orderId || '#FF-2024-012',
                date: stateOrder.createdAt ? new Date(stateOrder.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                items: stateOrder.items || [],
                subtotal: stateOrder.subtotal || stateOrder.total || 0,
                deliveryFee: stateOrder.deliveryFee || 0,
                discount: stateOrder.discount || 0,
                total: stateOrder.total || 0,
                payment: stateOrder.paymentMethod || 'Cash on Delivery',
                address: stateOrder.address || 'Harnoli, Tehsil Piplan, Mianwali',
                estimatedTime: stateOrder.estimatedTime || '30-40 min',
                deliveryPerson: stateOrder.deliveryPerson || 'Ali Khan'
            });
            setLoading(false);
        } else if (orderId) {
            fetchOrderDetails(orderId);
        } else {
            toast.warning('No order found', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            navigate('/menu');
        }
    }, []);

    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await orderAPI.getSingle(orderId);
            if (response.data.status === 1) {
                const orderData = response.data.data;
                setOrder({
                    id: orderData._id,
                    date: new Date(orderData.createdAt).toLocaleDateString(),
                    items: orderData.items || [],
                    subtotal: orderData.subtotal || orderData.total || 0,
                    deliveryFee: orderData.deliveryFee || 0,
                    discount: orderData.discount || 0,
                    total: orderData.total || 0,
                    payment: orderData.paymentMethod || 'Cash on Delivery',
                    address: orderData.address || 'Harnoli, Tehsil Piplan, Mianwali',
                    estimatedTime: orderData.estimatedTime || '30-40 min',
                    deliveryPerson: orderData.deliveryPerson || 'Ali Khan'
                });
            } else {
                toast.error('Failed to load order details');
                navigate('/menu');
            }
        } catch (error) {
            console.error('Order Details Error:', error);
            toast.error('Failed to load order details');
            navigate('/menu');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle feedback submit
    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setFeedbackSubmitting(true);

        if (feedback.rating === 0) {
            toast.warning('Please select a rating');
            setFeedbackSubmitting(false);
            return;
        }

        if (!feedback.review.trim()) {
            toast.warning('Please write a review');
            setFeedbackSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.info('Please login to submit feedback');
                setFeedbackSubmitting(false);
                return;
            }

            const response = await fetch('http://localhost:8000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId: order.id,
                    rating: feedback.rating,
                    review: feedback.review,
                    location: order.address || ''
                })
            });

            const data = await response.json();

            if (data.status === 1) {
                setFeedbackSubmitted(true);
                toast.success('Thank you for your feedback! ❤️');
            } else {
                toast.error(data.message || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Feedback Error:', error);
            toast.error('Failed to submit feedback');
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    const handleReorder = async () => {
        if (!order) return;
        
        try {
            const cartAPI = (await import('../src/api')).cartAPI;
            for (const item of order.items) {
                await cartAPI.add({
                    itemId: item.itemId || item._id,
                    quantity: item.quantity || 1
                });
            }
            toast.success('🔄 Items added to cart!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            setTimeout(() => navigate('/cart'), 1500);
        } catch (error) {
            console.error('Reorder Error:', error);
            toast.error('Failed to reorder. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
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

    if (!order) {
        return (
            <>
                <Navbar />
                <div className="text-center py-5">
                    <h3 className="fw-bold">Order not found</h3>
                    <Button className="btn-primary-custom mt-3" onClick={() => navigate('/menu')}>
                        Back to Menu
                    </Button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="confirmation-section py-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={7}>
                            {/* Success Header */}
                            <div className="text-center mb-4">
                                <div className="confirmation-icon">
                                    ✅
                                </div>
                                <h2 className="confirmation-title">Order Confirmed! 🎉</h2>
                                <p className="confirmation-subtitle">Thank you for your order. We'll start preparing it right away.</p>
                            </div>

                            {/* Order Details */}
                            <Card className="confirmation-order-card mb-4">
                                <Card.Body className="p-4">
                                    <div className="confirmation-order-header">
                                        <div>
                                            <Badge className="confirmation-order-badge">Order #{order.id}</Badge>
                                            <p className="confirmation-order-date">📅 {order.date}</p>
                                        </div>
                                        <div className="text-end">
                                            <Badge className="confirmation-time-badge">⏱️ {order.estimatedTime}</Badge>
                                            <p className="confirmation-time-label">Estimated Delivery</p>
                                        </div>
                                    </div>

                                    <hr className="confirmation-divider" />

                                    <h6 className="confirmation-items-title">Order Items</h6>
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, idx) => (
                                            <div key={idx} className="confirmation-item">
                                                <div>
                                                    <span className="confirmation-item-qty">{item.quantity || 1}x </span>
                                                    <span className="confirmation-item-name">{item.name}</span>
                                                </div>
                                                <span className="confirmation-item-price">Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-secondary">No items found</p>
                                    )}

                                    <hr className="confirmation-divider" />

                                    <div className="confirmation-summary-row">
                                        <span className="text-secondary">Subtotal</span>
                                        <span>Rs. {order.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="confirmation-summary-row">
                                        <span className="text-secondary">Delivery Fee</span>
                                        <span>{order.deliveryFee === 0 ? 'Free' : `Rs. ${order.deliveryFee}`}</span>
                                    </div>
                                    <div className="confirmation-summary-discount">
                                        <span>Discount</span>
                                        <span>- Rs. {order.discount.toLocaleString()}</span>
                                    </div>

                                    <hr className="confirmation-divider" />

                                    <div className="confirmation-total">
                                        <span className="fw-bold">Total</span>
                                        <span className="confirmation-total-amount">Rs. {order.total.toLocaleString()}</span>
                                    </div>

                                    <div className="confirmation-address-section">
                                        <p className="confirmation-address-text"><strong>📍 Delivery Address:</strong> {order.address}</p>
                                        <p className="confirmation-payment-text"><strong>💳 Payment Method:</strong> {order.payment}</p>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Delivery Person */}
                            <Card className="confirmation-delivery-card mb-4">
                                <Card.Body className="p-4">
                                    <div className="confirmation-delivery-person">
                                        <div className="confirmation-delivery-icon">
                                            🛵
                                        </div>
                                        <div>
                                            <h6 className="confirmation-delivery-name">Delivery Person: {order.deliveryPerson}</h6>
                                            <p className="confirmation-delivery-info">Will contact you before delivery</p>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* ===== FEEDBACK SECTION ===== */}
                            {!feedbackSubmitted && (
                                <Card className="confirmation-feedback-card mb-4">
                                    <Card.Body className="p-4">
                                        <h6 className="confirmation-feedback-title">💬 Share Your Experience</h6>
                                        <p className="confirmation-feedback-text">
                                            How was your food and delivery? Help others by sharing your experience!
                                        </p>
                                        <Form onSubmit={handleFeedbackSubmit}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="confirmation-feedback-label">Rating</Form.Label>
                                                <div className="confirmation-rating-buttons">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Button
                                                            key={star}
                                                            className={`confirmation-rating-btn ${feedback.rating >= star ? 'active' : ''}`}
                                                            onClick={() => setFeedback({ ...feedback, rating: star })}
                                                        >
                                                            ⭐
                                                        </Button>
                                                    ))}
                                                </div>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="confirmation-feedback-label">Review</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows="3"
                                                    placeholder="Share your experience with us..."
                                                    className="confirmation-feedback-input"
                                                    value={feedback.review}
                                                    onChange={(e) => setFeedback({ ...feedback, review: e.target.value })}
                                                    disabled={feedbackSubmitted}
                                                />
                                            </Form.Group>
                                            <Button 
                                                className="confirmation-feedback-submit"
                                                type="submit"
                                                disabled={feedbackSubmitting}
                                            >
                                                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback ❤️'}
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            )}
                            
                            {feedbackSubmitted && (
                                <Card className="confirmation-thanks-card mb-4">
                                    <Card.Body className="p-4 text-center">
                                        <div className="confirmation-thanks-icon">❤️</div>
                                        <h5 className="confirmation-thanks-title">Thank You!</h5>
                                        <p className="confirmation-thanks-text">Your feedback helps us improve and helps others make better choices.</p>
                                    </Card.Body>
                                </Card>
                            )}
                            
                            {/* Actions */}
                            <div className="confirmation-actions">
                                <Button 
                                    className="confirmation-action-btn-reorder"
                                    onClick={handleReorder}
                                >
                                    🔄 Reorder
                                </Button>
                                <Button 
                                    className="confirmation-action-btn-track"
                                    onClick={() => navigate('/track-order')}
                                >
                                    📍 Track Order
                                </Button>
                                <Button 
                                    className="confirmation-action-btn-shop"
                                    onClick={() => navigate('/menu')}
                                >
                                    🍕 Continue Shopping
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
            <Footer />

            <style>{`
                /* ===== CONFIRMATION SECTION ===== */
                .confirmation-section {
                    background: var(--light);
                    min-height: 80vh;
                    padding: 40px 0;
                }

                /* ===== SUCCESS HEADER ===== */
                .confirmation-icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: var(--success-light);
                    font-size: 40px;
                }

                .confirmation-title {
                    font-weight: 700;
                    color: var(--success);
                    font-size: var(--font-2xl);
                }

                .confirmation-subtitle {
                    color: var(--text-secondary);
                    font-size: var(--font-md);
                }

                /* ===== ORDER CARD ===== */
                .confirmation-order-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                .confirmation-order-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .confirmation-order-badge {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .confirmation-order-date {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 0;
                }

                .confirmation-time-badge {
                    background: var(--secondary-gradient) !important;
                    color: var(--dark) !important;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    font-weight: 600;
                }

                .confirmation-time-label {
                    color: var(--text-secondary);
                    font-size: var(--font-xs);
                    margin-top: 4px;
                    margin-bottom: 0;
                }

                .confirmation-divider {
                    border-color: rgba(0, 0, 0, 0.05);
                    margin: 16px 0;
                }

                .confirmation-items-title {
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }

                .confirmation-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }

                .confirmation-item:last-child {
                    border-bottom: none;
                }

                .confirmation-item-qty {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .confirmation-item-name {
                    color: var(--text-secondary);
                }

                .confirmation-item-price {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .confirmation-summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    color: var(--text-secondary);
                }

                .confirmation-summary-discount {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    color: var(--success);
                }

                .confirmation-total {
                    display: flex;
                    justify-content: space-between;
                    font-weight: 700;
                    font-size: var(--font-lg);
                    color: var(--text-primary);
                }

                .confirmation-total-amount {
                    color: var(--primary);
                }

                .confirmation-address-section {
                    margin-top: 12px;
                }

                .confirmation-address-text {
                    margin-bottom: 4px;
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .confirmation-payment-text {
                    margin-bottom: 0;
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                /* ===== DELIVERY CARD ===== */
                .confirmation-delivery-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-sm);
                    background: var(--light-card);
                }

                .confirmation-delivery-person {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .confirmation-delivery-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--light-dark);
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .confirmation-delivery-name {
                    font-weight: 700;
                    margin-bottom: 0;
                    color: var(--text-primary);
                }

                .confirmation-delivery-info {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 0;
                }

                /* ===== FEEDBACK CARD ===== */
                .confirmation-feedback-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-sm);
                    background: var(--light-card);
                }

                .confirmation-feedback-title {
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }

                .confirmation-feedback-text {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 16px;
                }

                .confirmation-feedback-label {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: var(--font-sm);
                }

                .confirmation-rating-buttons {
                    display: flex;
                    gap: 8px;
                }

                .confirmation-rating-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 2px solid var(--light-dark);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 18px;
                    transition: all var(--transition-normal);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .confirmation-rating-btn:hover {
                    border-color: var(--secondary);
                    transform: scale(1.05);
                }

                .confirmation-rating-btn.active {
                    background: var(--secondary-gradient);
                    border-color: var(--secondary);
                    color: var(--dark);
                }

                .confirmation-feedback-input {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    transition: all var(--transition-normal);
                }

                .confirmation-feedback-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .confirmation-feedback-input:disabled {
                    opacity: 0.6;
                }

                .confirmation-feedback-submit {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    width: 100%;
                    padding: 12px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .confirmation-feedback-submit:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .confirmation-feedback-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== THANKS CARD ===== */
                .confirmation-thanks-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    background: rgba(40, 167, 69, 0.08) !important;
                    border: 1px solid rgba(40, 167, 69, 0.1) !important;
                }

                .confirmation-thanks-icon {
                    font-size: 48px;
                    margin-bottom: 8px;
                }

                .confirmation-thanks-title {
                    font-weight: 700;
                    color: var(--success);
                }

                .confirmation-thanks-text {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                /* ===== ACTION BUTTONS ===== */
                .confirmation-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .confirmation-action-btn-reorder {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    padding: 10px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .confirmation-action-btn-reorder:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .confirmation-action-btn-track {
                    background: transparent !important;
                    border: 2px solid var(--dark) !important;
                    color: var(--dark) !important;
                    padding: 10px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .confirmation-action-btn-track:hover {
                    background: var(--dark) !important;
                    color: white !important;
                    transform: translateY(-3px);
                }

                .confirmation-action-btn-shop {
                    background: transparent !important;
                    border: 2px solid var(--text-secondary) !important;
                    color: var(--text-secondary) !important;
                    padding: 10px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .confirmation-action-btn-shop:hover {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    transform: translateY(-3px);
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .confirmation-order-card,
                [data-theme="dark"] .confirmation-delivery-card,
                [data-theme="dark"] .confirmation-feedback-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .confirmation-item {
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .confirmation-divider {
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .confirmation-feedback-input {
                    background: var(--dark-card) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .confirmation-rating-btn {
                    border-color: rgba(255, 255, 255, 0.1);
                }

                [data-theme="dark"] .confirmation-delivery-icon {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .confirmation-action-btn-track {
                    border-color: var(--text-secondary);
                    color: var(--text-secondary);
                }

                [data-theme="dark"] .confirmation-action-btn-track:hover {
                    background: var(--text-secondary);
                    color: var(--dark);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .confirmation-section {
                        padding: 30px 0;
                    }

                    .confirmation-title {
                        font-size: var(--font-xl);
                    }

                    .confirmation-order-header {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .confirmation-order-header .text-end {
                        text-align: left !important;
                    }

                    .confirmation-actions {
                        flex-direction: column;
                    }

                    .confirmation-actions .btn {
                        width: 100%;
                        text-align: center;
                    }

                    .confirmation-icon {
                        width: 60px;
                        height: 60px;
                        font-size: 30px;
                    }

                    .confirmation-total {
                        font-size: var(--font-md);
                    }

                    .confirmation-rating-buttons {
                        flex-wrap: wrap;
                    }

                    .confirmation-rating-btn {
                        width: 38px;
                        height: 38px;
                        font-size: 16px;
                    }
                }

                @media (max-width: 576px) {
                    .confirmation-section {
                        padding: 20px 0;
                    }

                    .confirmation-title {
                        font-size: var(--font-lg);
                    }

                    .confirmation-subtitle {
                        font-size: var(--font-sm);
                    }

                    .confirmation-order-card .p-4,
                    .confirmation-delivery-card .p-4,
                    .confirmation-feedback-card .p-4 {
                        padding: 16px !important;
                    }

                    .confirmation-item {
                        font-size: var(--font-sm);
                    }

                    .confirmation-total-amount {
                        font-size: var(--font-md);
                    }
                }
            `}</style>
        </>
    );
};

export default OrderConfirmation;