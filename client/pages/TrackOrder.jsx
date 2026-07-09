import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, ProgressBar, Table, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { useSearchParams } from 'react-router-dom'; // ✅ ADD THIS IMPORT
import { orderAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TrackOrder = () => {
    const [searchParams] = useSearchParams(); // ✅ GET URL PARAMETERS
    const [orderId, setOrderId] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState('');

    // ✅ AUTO-TRACK WHEN PAGE LOADS WITH ORDER PARAM
    useEffect(() => {
        const orderParam = searchParams.get('order');
        if (orderParam) {
            setOrderId(orderParam);
            // Auto-track the order
            setTimeout(() => {
                handleTrack({ preventDefault: () => {} });
            }, 500);
        }
    }, [searchParams]);

    const statuses = [
        { key: 'Pending', label: 'Order Placed', icon: '📦', color: '#F4A81D' },
        { key: 'Preparing', label: 'Preparing Food', icon: '👨‍🍳', color: '#C1401E' },
        { key: 'On Delivery', label: 'On Delivery', icon: '🛵', color: '#0d6efd' },
        { key: 'Delivered', label: 'Delivered', icon: '🏠', color: '#198754' },
        { key: 'Cancelled', label: 'Cancelled', icon: '❌', color: '#dc3545' }
    ];

    const getStatusProgress = (status) => {
        const progressMap = {
            'Pending': 25,
            'Preparing': 50,
            'On Delivery': 75,
            'Delivered': 100,
            'Cancelled': 100
        };
        return progressMap[status] || 0;
    };

    const getTimeline = (order) => {
        const status = order.status || 'Pending';
        const items = [
            { time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A', status: 'Order Placed', completed: true }
        ];

        if (status !== 'Pending') {
            items.push({ 
                time: order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString() : 'N/A', 
                status: 'Order Confirmed', 
                completed: true 
            });
        }

        if (status === 'Preparing' || status === 'On Delivery' || status === 'Delivered') {
            items.push({ 
                time: 'Processing...', 
                status: 'Preparing Food', 
                completed: true 
            });
        }

        if (status === 'On Delivery' || status === 'Delivered') {
            items.push({ 
                time: 'On the way', 
                status: 'On Delivery', 
                completed: true 
            });
        }

        if (status === 'Delivered') {
            items.push({ 
                time: 'Delivered', 
                status: 'Delivered', 
                completed: true 
            });
        }

        return items;
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        setError('');
        setIsTracking(true);
        setOrderData(null);

        if (!orderId.trim()) {
            toast.warning('⚠️ Please enter an order ID.', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            setIsTracking(false);
            return;
        }

        try {
            const response = await orderAPI.getSingle(orderId);
            if (response.data.status === 1) {
                const order = response.data.data;
                setOrderData({
                    id: order._id || order.id,
                    date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
                    status: order.status || 'Pending',
                    statusProgress: getStatusProgress(order.status || 'Pending'),
                    items: order.items || [],
                    total: order.total || 0,
                    payment: order.paymentMethod || 'Cash on Delivery',
                    address: order.address || 'N/A',
                    deliveryPerson: {
                        name: order.deliveryPerson || 'Not assigned yet',
                        phone: order.deliveryPhone || 'N/A',
                        eta: order.estimatedTime || '30-40 min'
                    },
                    timeline: getTimeline(order)
                });
                toast.success(`📍 Tracking order ${orderId}`, {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Order not found. Please check your order ID.';
            setError(message);
            toast.error(message, {
                position: "top-right",
                autoClose: 4000,
                theme: "colored",
            });
        } finally {
            setIsTracking(false);
        }
    };

    const getStatusIcon = (status) => {
        const found = statuses.find(s => s.key === status);
        return found ? found.icon : '📦';
    };

    const getStatusColor = (status) => {
        const found = statuses.find(s => s.key === status);
        return found ? found.color : '#6c757d';
    };

    const getStatusLabel = (status) => {
        const found = statuses.find(s => s.key === status);
        return found ? found.label : status;
    };

    const handleReorder = async () => {
        if (!orderData) return;
        try {
            const { cartAPI } = await import('../src/api');
            for (const item of orderData.items) {
                await cartAPI.add({
                    itemId: item.itemId || item._id,
                    quantity: item.quantity || 1,
                    name: item.name,
                    price: item.price,
                    image: item.image || '🍕',
                    options: item.items || ''
                });
            }
            window.dispatchEvent(new Event('cartUpdated'));
            toast.success('🔄 Items added to cart!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } catch (error) {
            toast.error('Failed to reorder', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        }
    };

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="track-section py-5">
                <Container>
                    <div className="track-header">
                        <h1 className="track-title">📍 Track Your Order</h1>
                        <p className="track-subtitle">
                            Enter your order ID to see the real-time status of your delivery.
                        </p>
                    </div>

                    {/* Search Form */}
                    <Row className="justify-content-center mb-4">
                        <Col lg={6} md={8}>
                            <Form onSubmit={handleTrack}>
                                <Form.Group className="track-search-group">
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter order ID (e.g., FF-2024-001)"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        className="track-search-input"
                                        required
                                    />
                                    <Button 
                                        type="submit" 
                                        className="track-search-btn"
                                        disabled={isTracking}
                                    >
                                        {isTracking ? 'Tracking...' : 'Track'}
                                    </Button>
                                </Form.Group>
                                {error && (
                                    <div className="track-error">{error}</div>
                                )}
                            </Form>
                        </Col>
                    </Row>

                    {!orderData && !isTracking && !error && (
                        <Row className="justify-content-center">
                            <Col lg={6}>
                                <Card className="track-empty-card">
                                    <div className="track-empty-icon">🔍</div>
                                    <h5 className="track-empty-title">Enter your order ID to track</h5>
                                    <p className="track-empty-text">You can find your order ID in the confirmation email or SMS.</p>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {isTracking && (
                        <Row className="justify-content-center">
                            <Col lg={8}>
                                <div className="track-loading">
                                    <Spinner animation="border" variant="danger" style={{ width: '50px', height: '50px' }} />
                                    <p className="track-loading-text">Looking for your order...</p>
                                </div>
                            </Col>
                        </Row>
                    )}

                    {orderData && !isTracking && (
                        <Row>
                            <Col lg={8} className="mx-auto">
                                {/* Order Header */}
                                <Card className="track-order-card mb-4">
                                    <Card.Body className="p-4">
                                        <div className="track-order-header">
                                            <div>
                                                <h4 className="track-order-id">{orderData.id}</h4>
                                                <p className="track-order-date">📅 {orderData.date}</p>
                                            </div>
                                            <div className="text-end">
                                                <Badge 
                                                    className="track-order-status"
                                                    style={{ backgroundColor: getStatusColor(orderData.status) }}
                                                >
                                                    {getStatusIcon(orderData.status)} {getStatusLabel(orderData.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Progress Bar */}
                                <Card className="track-progress-card mb-4">
                                    <Card.Body className="p-4">
                                        <div className="track-progress-header">
                                            <span className="fw-semibold">Order Progress</span>
                                            <span className="text-secondary">{orderData.statusProgress}%</span>
                                        </div>
                                        <ProgressBar 
                                            now={orderData.statusProgress} 
                                            className="track-progress-bar"
                                        />
                                        <div className="track-progress-steps">
                                            {statuses.map((s, idx) => (
                                                <div key={idx} className="track-progress-step">
                                                    <div className={`track-progress-icon ${orderData.statusProgress >= (idx + 1) * 25 ? 'active' : 'inactive'}`}>
                                                        {s.icon}
                                                    </div>
                                                    <span className="track-progress-label">{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Delivery Info */}
                                <Card className="track-delivery-card mb-4">
                                    <Card.Body className="p-4">
                                        <Row>
                                            <Col md={6}>
                                                <h6 className="track-section-title">📋 Order Details</h6>
                                                <p className="track-items-label"><strong>Items:</strong></p>
                                                {orderData.items.map((item, idx) => (
                                                    <div key={idx} className="track-item-row">
                                                        <span>{item.quantity || 1}x {item.name}</span>
                                                        <span>Rs. {(item.price || 0) * (item.quantity || 1)}</span>
                                                    </div>
                                                ))}
                                                <hr className="track-divider" />
                                                <div className="track-total-row">
                                                    <span className="fw-bold">Total</span>
                                                    <span className="fw-bold">Rs. {orderData.total.toLocaleString()}</span>
                                                </div>
                                                <p className="track-payment"><strong>Payment:</strong> {orderData.payment}</p>
                                                <p className="track-address"><strong>📍 Address:</strong> {orderData.address}</p>
                                            </Col>
                                            <Col md={6}>
                                                <h6 className="track-section-title">🛵 Delivery Person</h6>
                                                <div className="track-delivery-person">
                                                    <p><strong>Name:</strong> {orderData.deliveryPerson.name}</p>
                                                    <p><strong>Phone:</strong> {orderData.deliveryPerson.phone}</p>
                                                    <p><strong>ETA:</strong> {orderData.deliveryPerson.eta}</p>
                                                </div>
                                                <div className="mt-3">
                                                    <Button className="track-contact-btn w-100">
                                                        📞 Contact Delivery Person
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Timeline */}
                                <Card className="track-timeline-card mb-4">
                                    <Card.Body className="p-4">
                                        <h6 className="track-section-title">⏰ Order Timeline</h6>
                                        {orderData.timeline.map((item, idx) => (
                                            <div key={idx} className="track-timeline-item">
                                                <div className="track-timeline-icon">
                                                    <div className={item.completed ? 'completed' : ''}>
                                                        {item.completed ? '✓' : idx + 1}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className={`track-timeline-status ${item.completed ? 'completed' : ''}`}>
                                                        {item.status}
                                                    </p>
                                                    <small className="track-timeline-time">{item.time}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>

                                {/* Actions */}
                                <div className="track-actions">
                                    <Button 
                                        className="track-reorder-btn"
                                        onClick={handleReorder}
                                    >
                                        🍕 Reorder
                                    </Button>
                                    
                                    <Button 
                                        className="track-another-btn"
                                        onClick={() => {
                                            setOrderData(null);
                                            setOrderId('');
                                            setError('');
                                            toast.info('🔍 Enter another order ID to track.', {
                                                position: "top-right",
                                                autoClose: 2000,
                                                theme: "colored",
                                            });
                                        }}
                                    >
                                        🔍 Track Another
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    )}
                </Container>
            </section>
            <Footer />

            <style>{`
                .track-section {
                    background: var(--light);
                    min-height: 80vh;
                    padding: 40px 0;
                }

                .track-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .track-title {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }

                .track-subtitle {
                    color: var(--text-secondary);
                    max-width: 500px;
                    margin: 0 auto;
                }

                .track-search-group {
                    display: flex;
                    gap: 12px;
                }

                .track-search-input {
                    padding: 14px 20px;
                    border-radius: var(--radius-full) !important;
                    border: 2px solid var(--primary) !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    transition: all var(--transition-normal);
                }

                .track-search-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .track-search-btn {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    padding: 14px 32px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .track-search-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .track-search-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .track-error {
                    color: var(--danger);
                    text-align: center;
                    margin-top: 8px;
                    font-size: var(--font-sm);
                }

                .track-empty-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                    text-align: center;
                    padding: 32px;
                }

                .track-empty-icon {
                    font-size: 72px;
                    margin-bottom: 16px;
                }

                .track-empty-title {
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }

                .track-empty-text {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .track-loading {
                    text-align: center;
                    padding: 40px 0;
                }

                .track-loading-text {
                    margin-top: 12px;
                    color: var(--text-secondary);
                }

                .track-order-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                .track-order-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                }

                .track-order-id {
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .track-order-date {
                    color: var(--text-secondary);
                    margin-bottom: 0;
                }

                .track-order-status {
                    font-size: var(--font-md);
                    padding: 8px 16px;
                    border-radius: var(--radius-full);
                }

                .track-progress-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                .track-progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .track-progress-bar {
                    height: 12px;
                    border-radius: var(--radius-full);
                    background-color: var(--light-dark);
                }

                .track-progress-bar .progress-bar {
                    background: var(--primary-gradient) !important;
                    border-radius: var(--radius-full);
                }

                .track-progress-steps {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 12px;
                }

                .track-progress-step {
                    text-align: center;
                    font-size: var(--font-xs);
                }

                .track-progress-icon {
                    margin-bottom: 4px;
                    font-size: var(--font-md);
                    transition: all var(--transition-normal);
                }

                .track-progress-icon.active {
                    opacity: 1;
                }

                .track-progress-icon.inactive {
                    opacity: 0.25;
                }

                .track-progress-label {
                    color: var(--text-secondary);
                    display: none;
                }

                @media (min-width: 768px) {
                    .track-progress-label {
                        display: block;
                    }
                }

                .track-delivery-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                .track-section-title {
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }

                .track-items-label {
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .track-item-row {
                    display: flex;
                    justify-content: space-between;
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .track-divider {
                    border-color: rgba(0, 0, 0, 0.05);
                    margin: 8px 0;
                }

                .track-total-row {
                    display: flex;
                    justify-content: space-between;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .track-payment {
                    margin-top: 8px;
                    margin-bottom: 4px;
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .track-address {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .track-delivery-person {
                    background: var(--light-dark);
                    padding: 12px 16px;
                    border-radius: var(--radius-sm);
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .track-delivery-person p {
                    margin-bottom: 4px;
                }

                .track-contact-btn {
                    background: transparent !important;
                    border: 2px solid var(--danger) !important;
                    color: var(--danger) !important;
                    padding: 8px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .track-contact-btn:hover {
                    background: var(--danger) !important;
                    color: white !important;
                }

                .track-timeline-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                .track-timeline-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }

                .track-timeline-item:last-child {
                    border-bottom: none;
                }

                .track-timeline-icon {
                    flex-shrink: 0;
                }

                .track-timeline-icon div {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    background: var(--light-dark);
                    color: var(--text-secondary);
                    transition: all var(--transition-normal);
                }

                .track-timeline-icon div.completed {
                    background: var(--primary);
                    color: white;
                }

                .track-timeline-status {
                    font-weight: 600;
                    margin-bottom: 0;
                    color: var(--text-secondary);
                }

                .track-timeline-status.completed {
                    color: var(--text-primary);
                }

                .track-timeline-time {
                    color: var(--text-secondary);
                    font-size: var(--font-xs);
                }

                .track-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .track-reorder-btn {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    padding: 10px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .track-reorder-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .track-another-btn {
                    background: transparent !important;
                    border: 2px solid var(--text-secondary) !important;
                    color: var(--text-secondary) !important;
                    padding: 10px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .track-another-btn:hover {
                    background: var(--text-secondary) !important;
                    color: white !important;
                }

                [data-theme="dark"] .track-order-card,
                [data-theme="dark"] .track-progress-card,
                [data-theme="dark"] .track-delivery-card,
                [data-theme="dark"] .track-timeline-card,
                [data-theme="dark"] .track-empty-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .track-search-input {
                    background: var(--dark-card) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .track-delivery-person {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .track-timeline-item {
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .track-timeline-icon div {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .track-divider {
                    border-color: rgba(255, 255, 255, 0.05);
                }

                @media (max-width: 768px) {
                    .track-section {
                        padding: 30px 0;
                    }

                    .track-title {
                        font-size: var(--font-2xl);
                    }

                    .track-search-group {
                        flex-direction: column;
                    }

                    .track-search-btn {
                        width: 100%;
                    }

                    .track-order-header {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .track-order-header .text-end {
                        text-align: left !important;
                    }

                    .track-progress-steps {
                        gap: 4px;
                    }

                    .track-actions {
                        flex-direction: column;
                    }

                    .track-actions .btn {
                        width: 100%;
                        text-align: center;
                    }
                }

                @media (max-width: 576px) {
                    .track-section {
                        padding: 20px 0;
                    }

                    .track-title {
                        font-size: var(--font-xl);
                    }

                    .track-order-card .p-4,
                    .track-progress-card .p-4,
                    .track-delivery-card .p-4,
                    .track-timeline-card .p-4 {
                        padding: 16px !important;
                    }

                    .track-order-id {
                        font-size: var(--font-md);
                    }

                    .track-order-status {
                        font-size: var(--font-sm);
                    }

                    .track-progress-step {
                        font-size: 10px;
                    }

                    .track-progress-icon {
                        font-size: var(--font-sm);
                    }
                }
            `}</style>
        </>
    );
};

export default TrackOrder;