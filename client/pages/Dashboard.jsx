import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { userAPI, orderAPI, adminAPI, authAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios'

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [showVerifyOTP, setShowVerifyOTP] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [userStats, setUserStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        memberSince: '',
        averageRating: 0
    });

    const [user, setUser] = useState({
        name: 'Guest',
        email: '',
        phone: '',
        address: '',
        city: '',
        joinDate: '',
        isVerified: false,
        addresses: [],
        payments: []
    });

    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        email: ''
    });

    const [newAddress, setNewAddress] = useState({
        address: '',
        default: false
    });

    const [newPayment, setNewPayment] = useState({
        type: 'JazzCash',
        accountNo: '',
        accountHolderName: '',
        default: false
    });

    const addresses = user.addresses || [];
    const payments = user.payments || [];

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            setUser({
                name: userData.name || 'Guest',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || '',
                city: userData.city || '',
                joinDate: userData.joinDate || '',
                isVerified: userData.isVerified || false,
                addresses: userData.addresses || [],
                payments: userData.payments || [],
                status: userData.status || ''
            });
            setEditForm({
                name: userData.name || '',
                phone: userData.phone || '',
                address: userData.address || '',
                city: userData.city || '',
                email: userData.email || ''
            });

            const statsResponse = await userAPI.getStats();
            if (statsResponse.data.status === 1) {
                setUserStats(statsResponse.data.data);
            }

            const ordersResponse = await orderAPI.getAll();
            if (ordersResponse.data.status === 1) {
                setOrders(ordersResponse.data.data || []);
            }

        } catch (error) {
            console.error('Dashboard Error:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, []);

    const getStatusBadge = (status) => {
        const colors = {
            'Pending': 'warning',
            'Preparing': 'info',
            'On Delivery': 'primary',
            'Delivered': 'success',
            'Cancelled': 'danger',
            'CancelledByUser': 'danger'
        };
        return colors[status] || 'secondary';
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const handleReorder = async (order) => {
        try {
            if (!order.items || order.items.length === 0) {
                toast.error('No items to reorder');
                return;
            }

            const cartAPI = (await import('../src/api')).cartAPI;
            for (const item of order.items) {
                await cartAPI.add({
                    itemId: item.itemId || item._id,
                    quantity: item.quantity || 1,
                    name: item.name,
                    price: item.price,
                    image: item.image || '🍕',
                    options: item.options
                });
            }
            toast.success('🔄 Items added to cart!');
            setShowOrderModal(false);
            setTimeout(() => navigate('/cart'), 1000);
        } catch (error) {
            toast.error('Failed to reorder. Please try again.');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm(`Are you sure you want to cancel order ${orderId}?`)) {
            try {
                const singleOrder = await orderAPI.getSingle(orderId);
                if (singleOrder.data.data.status !== 'Pending') {
                    toast.info('Your order is on the way so cannot be cancelled!');
                    return;
                }
                const response = await adminAPI.updateOrderStatus(orderId, 'CancelledByUser');
                if (response.data.status === 1) {
                    toast.warning(`❌ Order ${orderId} cancelled.`);
                    fetchDashboardData();
                }
            } catch (error) {
                toast.error('Failed to cancel order');
            }
        }
    };

    const handleTrackOrder = (orderId) => {
        navigate(`/track-order?order=${orderId}`);
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await userAPI.updateProfile({
                ...editForm,
                addresses: user.addresses || [],
                payments: user.payments || []
            });
            if (response.data.status === 1) {
                toast.success('✅ Profile updated successfully!');
                const updatedUser = { ...user, ...editForm };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setShowEditProfile(false);
                fetchDashboardData();
            }
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleSetDefaultAddress = async (id) => {
        const updatedAddresses = addresses.map(addr => ({
            ...addr,
            default: addr.id === id
        }));

        try {
            const response = await userAPI.updateProfile({
                addresses: updatedAddresses
            });
            if (response.data.status === 1) {
                const updatedUser = { ...user, addresses: updatedAddresses };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('📍 Default address updated!');
                fetchDashboardData();
            }
        } catch (error) {
            toast.error('Failed to update default address');
        }
    };

    const handleAddAddress = async () => {
        if (!newAddress.address) {
            toast.warning('Please enter address');
            return;
        }

        const newAddr = {
            id: Date.now(),
            address: newAddress.address,
            default: newAddress.default
        };

        let updatedAddresses = [...addresses, newAddr];
        if (newAddress.default) {
            updatedAddresses = updatedAddresses.map(a => ({ ...a, default: false }));
            const lastIndex = updatedAddresses.length - 1;
            updatedAddresses[lastIndex].default = true;
        }

        try {
            const response = await userAPI.updateProfile({
                addresses: updatedAddresses
            });
            if (response.data.status === 1) {
                const updatedUser = { ...user, addresses: updatedAddresses };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setNewAddress({ address: '', default: false });
                setShowAddAddress(false);
                toast.success('✅ Address added successfully!');
                fetchDashboardData();
            }
        } catch (error) {
            toast.error('Failed to save address');
        }
    };

    const handleSetDefaultPayment = async (id) => {
        const updatedPayments = payments.map(pay => ({
            ...pay,
            default: pay.id === id
        }));

        try {
            const response = await userAPI.updateProfile({
                payments: updatedPayments
            });
            if (response.data.status === 1) {
                const updatedUser = { ...user, payments: updatedPayments };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('💳 Default payment updated!');
                fetchDashboardData();
            }
        } catch (error) {
            toast.error('Failed to update default payment');
        }
    };

    const handleAddPayment = async () => {
        if (!newPayment.accountNo || !newPayment.accountHolderName) {
            toast.warning('Please fill all fields');
            return;
        }

        const newPay = {
            id: Date.now(),
            type: newPayment.type,
            accountNo: newPayment.accountNo,
            accountHolderName: newPayment.accountHolderName,
            label: `${newPayment.type} - ${newPayment.accountNo}`,
            default: newPayment.default
        };

        let updatedPayments = [...payments, newPay];
        if (newPayment.default) {
            updatedPayments = updatedPayments.map(p => ({ ...p, default: false }));
            const lastIndex = updatedPayments.length - 1;
            updatedPayments[lastIndex].default = true;
        }

        try {
            const response = await userAPI.updateProfile({
                payments: updatedPayments
            });
            if (response.data.status === 1) {
                const updatedUser = { ...user, payments: updatedPayments };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setNewPayment({ type: 'JazzCash', accountNo: '', accountHolderName: '', default: false });
                setShowPayment(false);
                toast.success('✅ Payment method added successfully!');
                fetchDashboardData();
            }
        } catch (error) {
            toast.error('Failed to save payment');
        }
    };

    const handleSendOTP = async () => {
        if (!user.email) {
            toast.warning('No email found. Please update your profile first.');
            return;
        }
        try {
            const response = await authAPI.forgotPassword(user.email);
            if (response.data.status === 1) {
                setOtpSent(true);
                toast.success('📧 OTP sent to your email!');
            }
        } catch (error) {
            toast.error('Failed to send OTP');
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpCode || otpCode.length !== 6) {
            toast.warning('Please enter a valid 6-digit OTP');
            return;
        }
        setIsVerifying(true);
        try {
            const response = await authAPI.verifyOTP(user.email, otpCode);
            if (response.data.status === 1) {
                toast.success('✅ Email verified successfully!');
                const updatedUser = { ...user, isVerified: true };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setShowVerifyOTP(false);
                setOtpSent(false);
                setOtpCode('');
                fetchDashboardData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsVerifying(false);
        }
    };

    const recentOrders = orders.slice(0, 5);

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

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="dashboard-section py-4">
                <Container>
                    {/* Welcome Section */}
                    <Row className="mb-4">
                        <Col>
                            <div className="dashboard-welcome">
                                <h2 className="dashboard-welcome-title">
                                    👋 Welcome back, {user.name || 'Guest'}!
                                </h2>
                                {user.isVerified && (
                                    <Badge className="dashboard-verified-badge">✅ Verified</Badge>
                                )}
                                {!user.isVerified && user.email && (
                                    <Button 
                                        className="dashboard-verify-btn"
                                        onClick={() => setShowVerifyOTP(true)}
                                    >
                                        Verify Email
                                    </Button>
                                )}
                            </div>
                            <p className="dashboard-welcome-subtitle">Here's your order summary and account details.</p>
                            
                            {/* INACTIVE ALERT */}
                            {user.status === 'inactive' && (
                                <Alert className="dashboard-alert-inactive">
                                    <div className="dashboard-alert-icon">⚠️</div>
                                    <div>
                                        <h6 className="dashboard-alert-title">Account Inactive</h6>
                                        <p className="dashboard-alert-text">
                                            Your account is currently inactive. Please contact support to reactivate your account.
                                        </p>
                                    </div>
                                </Alert>
                            )}

                            {/* BLOCKED ALERT */}
                            {user.status === 'blocked' && (
                                <Alert className="dashboard-alert-blocked">
                                    <div className="dashboard-alert-icon">⛔</div>
                                    <div>
                                        <h6 className="dashboard-alert-title-danger">Account Blocked</h6>
                                        <p className="dashboard-alert-text">
                                            Your account has been blocked. Please contact support for assistance.
                                        </p>
                                    </div>
                                </Alert>
                            )}
                        </Col>
                        <Col xs="auto" className="d-flex gap-2 mt-3 align-items-start">
                            <Button className="dashboard-order-btn" onClick={() => navigate('/menu')}>
                                🍕 Order Now
                            </Button>
                            <Button className="dashboard-edit-btn" onClick={() => setShowEditProfile(true)}>
                                ✏️ Edit Profile
                            </Button>
                        </Col>
                    </Row>

                    {/* User Stats */}
                    <Row className="g-3 mb-4">
                        <Col lg={3} md={6}>
                            <Card className="dashboard-stat-card">
                                <Card.Body>
                                    <div className="dashboard-stat-icon">📦</div>
                                    <h3 className="dashboard-stat-number">{userStats.totalOrders || 0}</h3>
                                    <p className="dashboard-stat-label">Total Orders</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card className="dashboard-stat-card">
                                <Card.Body>
                                    <div className="dashboard-stat-icon">💰</div>
                                    <h3 className="dashboard-stat-number">Rs. {userStats.totalSpent?.toLocaleString() || 0}</h3>
                                    <p className="dashboard-stat-label">Total Spent</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card className="dashboard-stat-card">
                                <Card.Body>
                                    <div className="dashboard-stat-icon">⭐</div>
                                    <h3 className="dashboard-stat-number">{userStats.averageRating || 0}★</h3>
                                    <p className="dashboard-stat-label">Average Rating</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card className="dashboard-stat-card">
                                <Card.Body>
                                    <div className="dashboard-stat-icon">🎉</div>
                                    <h3 className="dashboard-stat-number">Member</h3>
                                    <p className="dashboard-stat-label">Since {new Date(userStats.memberSince).toLocaleDateString()}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Recent Orders */}
                    <Row className="mb-4">
                        <Col>
                            <Card className="dashboard-orders-card">
                                <Card.Header className="dashboard-orders-header">
                                    <h5 className="dashboard-orders-title">📋 Recent Orders</h5>
                                    <Button variant="link" className="dashboard-orders-view-all">
                                        View All
                                    </Button>
                                </Card.Header>
                                <Card.Body className="dashboard-orders-body">
                                    <div className="table-responsive">
                                        <Table hover className="dashboard-orders-table">
                                            <thead className="dashboard-orders-thead">
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Date</th>
                                                    <th>Total</th>
                                                    <th>Status</th>
                                                    <th>Payment</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentOrders.length > 0 ? (
                                                    recentOrders.map((order) => (
                                                        <tr key={order._id} className="dashboard-order-row" onClick={() => handleOrderClick(order)}>
                                                            {order.status !== 'CancelledByUser' && (
                                                                <>
                                                                    <td className="fw-bold">{order._id?.slice(-6)}</td>
                                                                    <td>{new Date(order.createdAt).toLocaleString('en-US', {
                                                                      dateStyle: 'short',
                                                                      timeStyle: 'short'
                                                                    })}</td>
                                                                    <td>Rs. {order.total?.toLocaleString()}</td>
                                                                    <td>
                                                                        <Badge className={`dashboard-status-${order.status?.toLowerCase() || 'pending'}`}>
                                                                            {order.status}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>{order.paymentMethod}</td>
                                                                    <td>
                                                                        <div className="d-flex gap-1">
                                                                            <Button
                                                                                className="dashboard-track-btn"
                                                                                onClick={(e) => { e.stopPropagation(); handleTrackOrder(order._id); }}
                                                                            >
                                                                                📍
                                                                            </Button>
                                                                            {order.status === 'Pending' && (
                                                                                <Button
                                                                                    className="dashboard-cancel-btn"
                                                                                    onClick={(e) => { e.stopPropagation(); handleCancelOrder(order._id); }}
                                                                                >
                                                                                    ✕
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-4 text-secondary">
                                                            No orders yet. Start ordering!
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Addresses & Payments */}
                    <Row className="g-4">
                        <Col lg={6}>
                            <Card className="dashboard-address-card">
                                <Card.Header className="dashboard-address-header">
                                    <h5 className="dashboard-address-title">📍 Saved Addresses</h5>
                                    <Button variant="link" className="dashboard-address-add" onClick={() => setShowAddAddress(true)}>
                                        + Add
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    {addresses.map((addr) => (
                                        <div key={addr.id} className="dashboard-address-item">
                                            <div>
                                                <Badge className={addr.default ? 'dashboard-address-badge-default' : 'dashboard-address-badge'}>
                                                    {addr.default ? 'Default' : 'Address'}
                                                </Badge>
                                                <span className="dashboard-address-text">{addr.address}</span>
                                            </div>
                                            {!addr.default && (
                                                <Button
                                                    className="dashboard-address-set-default"
                                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                                >
                                                    Set Default
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card className="dashboard-payment-card">
                                <Card.Header className="dashboard-payment-header">
                                    <h5 className="dashboard-payment-title">💳 Payment Methods</h5>
                                    <Button variant="link" className="dashboard-payment-add" onClick={() => setShowPayment(true)}>
                                        + Add
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    {payments.map((pay) => (
                                        <div key={pay.id} className="dashboard-payment-item">
                                            <div>
                                                <Badge className={pay.default ? 'dashboard-payment-badge-default' : 'dashboard-payment-badge'}>
                                                    {pay.default ? 'Default' : pay.type}
                                                </Badge>
                                                <span className="dashboard-payment-text">{pay.label}</span>
                                            </div>
                                            {!pay.default && (
                                                <Button
                                                    className="dashboard-payment-set-default"
                                                    onClick={() => handleSetDefaultPayment(pay.id)}
                                                >
                                                    Set Default
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Action Buttons */}
                    <Row className="mt-4 g-3">
                        <Col>
                            <div className="dashboard-actions">
                                <Button className="dashboard-action-new-order" onClick={() => navigate('/menu')}>
                                    🍕 New Order
                                </Button>
                                <Button className="dashboard-action-track" onClick={() => navigate('/track-order')}>
                                    📦 Track Order
                                </Button>
                                <Button className="dashboard-action-edit" onClick={() => setShowEditProfile(true)}>
                                    ✏️ Edit Profile
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Modals - using theme classes */}
            <Modal show={showEditProfile} onHide={() => setShowEditProfile(false)} size="lg" className="dashboard-modal">
                <Modal.Header closeButton>
                    <Modal.Title>✏️ Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="dashboard-modal-label">Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                className="dashboard-modal-input"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="dashboard-modal-label">Email</Form.Label>
                            <Form.Control
                                type="email"
                                className="dashboard-modal-input"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="dashboard-modal-label">Phone</Form.Label>
                            <Form.Control
                                type="text"
                                className="dashboard-modal-input"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="dashboard-modal-label">Address</Form.Label>
                            <Form.Control
                                type="text"
                                className="dashboard-modal-input"
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="dashboard-modal-label">City</Form.Label>
                            <Form.Control
                                type="text"
                                className="dashboard-modal-input"
                                value={editForm.city}
                                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="dashboard-modal-cancel" onClick={() => setShowEditProfile(false)}>Cancel</Button>
                    <Button className="dashboard-modal-save" onClick={handleUpdateProfile}>Save Changes</Button>
                </Modal.Footer>
            </Modal>

            {/* Add Address Modal */}
            <Modal show={showAddAddress} onHide={() => setShowAddAddress(false)} size="lg" className="dashboard-modal">
                <Modal.Header closeButton>
                    <Modal.Title>📍 Add Address</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="dashboard-modal-label">Address</Form.Label>
                            <Form.Control
                                type="text"
                                className="dashboard-modal-input"
                                placeholder="Enter your address"
                                value={newAddress.address}
                                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Set as default address"
                                className="dashboard-modal-checkbox"
                                checked={newAddress.default}
                                onChange={(e) => setNewAddress({ ...newAddress, default: e.target.checked })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="dashboard-modal-cancel" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                    <Button className="dashboard-modal-save" onClick={handleAddAddress}>Add Address</Button>
                </Modal.Footer>
            </Modal>

            {/* Add Payment Modal */}
            <Modal show={showPayment} onHide={() => setShowPayment(false)} size="lg" className="dashboard-modal">
                <Modal.Header closeButton>
                    <Modal.Title>💳 Add Payment Method</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="dashboard-modal-label">Payment Type</Form.Label>
                            <Form.Select
                                className="dashboard-modal-select"
                                value={newPayment.type}
                                onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                            >
                                <option value="JazzCash">JazzCash</option>
                                <option value="EasyPaisa">EasyPaisa</option>
                                <option value="UPaisa">UPaisa</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="dashboard-modal-label">Account Number</Form.Label>
                            <Form.Control
                                type="text"
                                className="dashboard-modal-input"
                                placeholder="Enter your account number"
                                value={newPayment.accountNo}
                                onChange={(e) => setNewPayment({ ...newPayment, accountNo: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="dashboard-modal-label">Account Holder Name</Form.Label>
                            <Form.Control
                                type="text"
                                className="dashboard-modal-input"
                                placeholder="Enter account holder name"
                                value={newPayment.accountHolderName}
                                onChange={(e) => setNewPayment({ ...newPayment, accountHolderName: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Set as default payment method"
                                className="dashboard-modal-checkbox"
                                checked={newPayment.default}
                                onChange={(e) => setNewPayment({ ...newPayment, default: e.target.checked })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="dashboard-modal-cancel" onClick={() => setShowPayment(false)}>Cancel</Button>
                    <Button className="dashboard-modal-save" onClick={handleAddPayment}>Add Payment</Button>
                </Modal.Footer>
            </Modal>

            {/* Verify OTP Modal */}
            <Modal show={showVerifyOTP} onHide={() => setShowVerifyOTP(false)} size="lg" className="dashboard-modal">
                <Modal.Header closeButton>
                    <Modal.Title>📧 Verify Email</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info" className="dashboard-otp-alert">
                        An OTP will be sent to <strong>{user.email}</strong> for verification.
                    </Alert>
                    {!otpSent ? (
                        <Button className="dashboard-otp-send-btn" onClick={handleSendOTP}>
                            Send OTP
                        </Button>
                    ) : (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label className="dashboard-modal-label">Enter OTP</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="dashboard-otp-input"
                                    placeholder="Enter 6-digit OTP"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
                                    maxLength="6"
                                />
                            </Form.Group>
                            <Button 
                                className="dashboard-otp-verify-btn"
                                onClick={handleVerifyOTP}
                                disabled={isVerifying}
                            >
                                {isVerifying ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                            <Button 
                                variant="link" 
                                className="dashboard-otp-resend-btn"
                                onClick={handleSendOTP}
                                disabled={isVerifying}
                            >
                                Resend OTP
                            </Button>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="dashboard-modal-cancel" onClick={() => setShowVerifyOTP(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Order Details Modal */}
            <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg" className="dashboard-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Order Details - {selectedOrder?._id?.slice(-6)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <div className="dashboard-order-detail-header">
                                <div>
                                    <Badge className={`dashboard-status-${selectedOrder.status?.toLowerCase() || 'pending'}`}>
                                        {selectedOrder.status}
                                    </Badge>
                                    <span className="dashboard-order-detail-date">📅 {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="dashboard-order-detail-total">Total: Rs. {selectedOrder.total?.toLocaleString()}</span>
                                </div>
                            </div>
                            <Table striped className="dashboard-order-detail-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>Rs. {item.price}</td>
                                            <td>Rs. {item.price * item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="fw-bold">
                                        <td colSpan="3" className="text-end">Total</td>
                                        <td>Rs. {selectedOrder.total?.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </Table>
                            <div className="dashboard-order-detail-info">
                                <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
                                <p><strong>Delivery Address:</strong> {selectedOrder.address}</p>
                            </div>
                            <div className="dashboard-order-detail-actions">
                                <Button className="dashboard-reorder-btn" onClick={() => handleReorder(selectedOrder)}>
                                    🔄 Reorder
                                </Button>
                                <Button className="dashboard-modal-cancel" onClick={() => setShowOrderModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            <Footer />

            <style>{`
                /* ===== DASHBOARD SECTION ===== */
                .dashboard-section {
                    background: var(--light);
                    min-height: 80vh;
                    padding: 20px 0 40px 0;
                }

                /* ===== WELCOME ===== */
                .dashboard-welcome {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .dashboard-welcome-title {
                    font-weight: 700;
                    margin-bottom: 0;
                    color: var(--text-primary);
                }

                .dashboard-verified-badge {
                    background: var(--success) !important;
                    color: white !important;
                    padding: 8px 20px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-md);
                }

                .dashboard-verify-btn {
                    background: transparent !important;
                    border: 2px solid var(--primary) !important;
                    color: var(--primary) !important;
                    padding: 6px 16px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .dashboard-verify-btn:hover {
                    background: var(--primary) !important;
                    color: white !important;
                }

                .dashboard-welcome-subtitle {
                    color: var(--text-secondary);
                    margin-top: 4px;
                }

                /* ===== ALERTS ===== */
                .dashboard-alert-inactive,
                .dashboard-alert-blocked {
                    margin-top: 12px;
                    margin-bottom: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-radius: var(--radius-sm);
                    padding: 12px 16px;
                }

                .dashboard-alert-inactive {
                    background: var(--warning-light) !important;
                    border-left: 4px solid var(--warning) !important;
                    color: var(--text-primary) !important;
                }

                .dashboard-alert-blocked {
                    background: var(--danger-light) !important;
                    border-left: 4px solid var(--danger) !important;
                    color: var(--text-primary) !important;
                }

                .dashboard-alert-icon {
                    font-size: 28px;
                }

                .dashboard-alert-title {
                    font-weight: 700;
                    margin-bottom: 0;
                    color: var(--warning);
                }

                .dashboard-alert-title-danger {
                    font-weight: 700;
                    margin-bottom: 0;
                    color: var(--danger);
                }

                .dashboard-alert-text {
                    margin-bottom: 0;
                    color: var(--text-secondary);
                }

                /* ===== ACTION BUTTONS ===== */
                .dashboard-order-btn {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    padding: 10px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .dashboard-order-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .dashboard-edit-btn {
                    background: transparent !important;
                    border: 2px solid var(--text-secondary) !important;
                    color: var(--text-secondary) !important;
                    padding: 10px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .dashboard-edit-btn:hover {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    transform: translateY(-3px);
                }

                /* ===== STAT CARDS ===== */
                .dashboard-stat-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-sm);
                    background: var(--light-card);
                    text-align: center;
                    padding: 8px;
                    transition: all var(--transition-normal);
                }

                .dashboard-stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-md);
                }

                .dashboard-stat-icon {
                    font-size: 36px;
                    margin-bottom: 8px;
                }

                .dashboard-stat-number {
                    font-weight: 700;
                    color: var(--text-primary);
                    font-size: var(--font-2xl);
                }

                .dashboard-stat-label {
                    color: var(--text-secondary);
                    margin-bottom: 0;
                }

                /* ===== ORDERS CARD ===== */
                .dashboard-orders-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                .dashboard-orders-header {
                    background: var(--light-card) !important;
                    border: none !important;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                }

                .dashboard-orders-title {
                    font-weight: 700;
                    margin-bottom: 0;
                    color: var(--text-primary);
                }

                .dashboard-orders-view-all {
                    color: var(--primary) !important;
                    text-decoration: none !important;
                    font-weight: 600;
                }

                .dashboard-orders-view-all:hover {
                    color: var(--primary-dark) !important;
                }

                .dashboard-orders-body {
                    padding: 0;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .dashboard-orders-table {
                    margin-bottom: 0;
                }

                .dashboard-orders-thead {
                    background: var(--light-dark);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .dashboard-orders-thead th {
                    color: var(--text-info);
                    font-weight: 600;
                }

                .dashboard-order-row {
                    cursor: pointer;
                    transition: background var(--transition-fast);
                }

                .dashboard-order-row:hover {
                    background: var(--light-dark) !important;
                }

                /* ===== STATUS BADGES ===== */
                .dashboard-status-pending {
                    background: var(--warning) !important;
                    color: var(--dark) !important;
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                }

                .dashboard-status-preparing {
                    background: var(--info) !important;
                    color: white !important;
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                }

                .dashboard-status-on-delivery {
                    background: var(--primary) !important;
                    color: white !important;
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                }

                .dashboard-status-delivered {
                    background: var(--success) !important;
                    color: white !important;
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                }

                .dashboard-status-cancelled {
                    background: var(--danger) !important;
                    color: white !important;
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                }

                /* ===== TRACK & CANCEL BUTTONS ===== */
                .dashboard-track-btn {
                    background: transparent !important;
                    border: 1px solid var(--primary) !important;
                    color: var(--primary) !important;
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                    font-size: var(--font-sm);
                    transition: all var(--transition-normal);
                }

                .dashboard-track-btn:hover {
                    background: var(--primary) !important;
                    color: white !important;
                }

                .dashboard-cancel-btn {
                    background: transparent !important;
                    border: 1px solid var(--danger) !important;
                    color: var(--danger) !important;
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                    font-size: var(--font-sm);
                    transition: all var(--transition-normal);
                }

                .dashboard-cancel-btn:hover {
                    background: var(--danger) !important;
                    color: white !important;
                }

                /* ===== ADDRESS CARD ===== */
                .dashboard-address-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                .dashboard-address-header {
                    background: var(--light-card) !important;
                    border: none !important;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                }

                .dashboard-address-title {
                    font-weight: 700;
                    margin-bottom: 0;
                    color: var(--text-primary);
                }

                .dashboard-address-add {
                    color: var(--primary) !important;
                    text-decoration: none !important;
                    font-weight: 600;
                }

                .dashboard-address-add:hover {
                    color: var(--primary-dark) !important;
                }

                .dashboard-address-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }

                .dashboard-address-item:last-child {
                    border-bottom: none;
                }

                .dashboard-address-badge {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-xs);
                    margin-right: 8px;
                }

                .dashboard-address-badge-default {
                    background: var(--primary) !important;
                    color: white !important;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-xs);
                    margin-right: 8px;
                }

                .dashboard-address-text {
                    color: var(--text-secondary);
                }

                .dashboard-address-set-default {
                    background: transparent !important;
                    border: 1px solid var(--text-secondary) !important;
                    color: var(--text-secondary) !important;
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-xs);
                    transition: all var(--transition-normal);
                }

                .dashboard-address-set-default:hover {
                    background: var(--text-secondary) !important;
                    color: white !important;
                }

                /* ===== PAYMENT CARD ===== */
                .dashboard-payment-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                }

                .dashboard-payment-header {
                    background: var(--light-card) !important;
                    border: none !important;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                }

                .dashboard-payment-title {
                    font-weight: 700;
                    margin-bottom: 0;
                    color: var(--text-primary);
                }

                .dashboard-payment-add {
                    color: var(--primary) !important;
                    text-decoration: none !important;
                    font-weight: 600;
                }

                .dashboard-payment-add:hover {
                    color: var(--primary-dark) !important;
                }

                .dashboard-payment-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }

                .dashboard-payment-item:last-child {
                    border-bottom: none;
                }

                .dashboard-payment-badge {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-xs);
                    margin-right: 8px;
                }

                .dashboard-payment-badge-default {
                    background: var(--success) !important;
                    color: white !important;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-xs);
                    margin-right: 8px;
                }

                .dashboard-payment-text {
                    color: var(--text-secondary);
                }

                .dashboard-payment-set-default {
                    background: transparent !important;
                    border: 1px solid var(--text-secondary) !important;
                    color: var(--text-secondary) !important;
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-xs);
                    transition: all var(--transition-normal);
                }

                .dashboard-payment-set-default:hover {
                    background: var(--text-secondary) !important;
                    color: white !important;
                }

                /* ===== ACTION BUTTONS ===== */
                .dashboard-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .dashboard-action-new-order {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    padding: 10px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .dashboard-action-new-order:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .dashboard-action-track {
                    background: transparent !important;
                    border: 2px solid var(--text-secondary) !important;
                    color: var(--text-secondary) !important;
                    padding: 10px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .dashboard-action-track:hover {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    transform: translateY(-3px);
                }

                .dashboard-action-edit {
                    background: transparent !important;
                    border: 2px solid var(--primary) !important;
                    color: var(--primary) !important;
                    padding: 10px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .dashboard-action-edit:hover {
                    background: var(--primary) !important;
                    color: white !important;
                    transform: translateY(-3px);
                }

                /* ===== MODAL ===== */
                .dashboard-modal .modal-content {
                    border-radius: var(--radius-lg);
                    background: var(--light-card);
                }

                .dashboard-modal .modal-header {
                    border-bottom-color: rgba(0, 0, 0, 0.05);
                }

                .dashboard-modal .modal-title {
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .dashboard-modal-label {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: var(--font-sm);
                }

                .dashboard-modal-input {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    transition: all var(--transition-normal);
                }

                .dashboard-modal-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .dashboard-modal-select {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                }

                .dashboard-modal-select:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .dashboard-modal-checkbox .form-check-input:checked {
                    background-color: var(--primary);
                    border-color: var(--primary);
                }

                .dashboard-modal-checkbox .form-check-label {
                    color: var(--text-secondary);
                }

                .dashboard-modal-cancel {
                    background: transparent !important;
                    border: 2px solid var(--text-secondary) !important;
                    color: var(--text-secondary) !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .dashboard-modal-cancel:hover {
                    background: var(--text-secondary) !important;
                    color: white !important;
                }

                .dashboard-modal-save {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .dashboard-modal-save:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== OTP MODAL ===== */
                .dashboard-otp-alert {
                    border: none !important;
                    border-radius: var(--radius-sm) !important;
                    background: var(--info-light) !important;
                    color: var(--info) !important;
                }

                .dashboard-otp-send-btn {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    width: 100%;
                    padding: 12px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .dashboard-otp-send-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .dashboard-otp-input {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    text-align: center;
                    font-size: 24px;
                    letter-spacing: 8px;
                }

                .dashboard-otp-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .dashboard-otp-verify-btn {
                    background: var(--success) !important;
                    border: none !important;
                    color: white !important;
                    width: 100%;
                    padding: 12px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .dashboard-otp-verify-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .dashboard-otp-verify-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .dashboard-otp-resend-btn {
                    color: var(--primary) !important;
                    text-decoration: none !important;
                    font-weight: 600;
                    display: block;
                    width: 100%;
                    text-align: center;
                    margin-top: 8px;
                }

                .dashboard-otp-resend-btn:hover:not(:disabled) {
                    color: var(--primary-dark) !important;
                    text-decoration: underline !important;
                }

                .dashboard-otp-resend-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== ORDER DETAIL MODAL ===== */
                .dashboard-order-detail-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .dashboard-order-detail-date {
                    color: var(--text-secondary);
                    margin-left: 12px;
                    font-size: var(--font-sm);
                }

                .dashboard-order-detail-total {
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .dashboard-order-detail-table {
                    border-radius: var(--radius-sm);
                    overflow: hidden;
                }

                .dashboard-order-detail-table thead {
                    background: var(--light-dark);
                }

                .dashboard-order-detail-table thead th {
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .dashboard-order-detail-info {
                    margin-top: 12px;
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .dashboard-order-detail-info p {
                    margin-bottom: 4px;
                }

                .dashboard-order-detail-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 16px;
                }

                .dashboard-reorder-btn {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .dashboard-reorder-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .dashboard-stat-card,
                [data-theme="dark"] .dashboard-orders-card,
                [data-theme="dark"] .dashboard-address-card,
                [data-theme="dark"] .dashboard-payment-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .dashboard-orders-header,
                [data-theme="dark"] .dashboard-address-header,
                [data-theme="dark"] .dashboard-payment-header {
                    background: var(--dark-card) !important;
                }

                [data-theme="dark"] .dashboard-orders-thead {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .dashboard-order-row:hover {
                    background: var(--dark-light) !important;
                }

                [data-theme="dark"] .dashboard-modal .modal-content {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .dashboard-modal-input,
                [data-theme="dark"] .dashboard-modal-select,
                [data-theme="dark"] .dashboard-otp-input {
                    background: var(--dark-card) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .dashboard-address-item,
                [data-theme="dark"] .dashboard-payment-item {
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .dashboard-alert-inactive {
                    background: rgba(255, 193, 7, 0.1) !important;
                }

                [data-theme="dark"] .dashboard-alert-blocked {
                    background: rgba(220, 53, 69, 0.1) !important;
                }

                [data-theme="dark"] .dashboard-otp-alert {
                    background: rgba(23, 162, 184, 0.1) !important;
                }

                [data-theme="dark"] .dashboard-order-detail-table thead {
                    background: var(--dark-light);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .dashboard-section {
                        padding: 15px 0 30px 0;
                    }

                    .dashboard-welcome {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .dashboard-welcome-title {
                        font-size: var(--font-xl);
                    }

                    .dashboard-stat-number {
                        font-size: var(--font-xl);
                    }

                    .dashboard-actions {
                        flex-direction: column;
                    }

                    .dashboard-actions .btn {
                        width: 100%;
                        text-align: center;
                    }

                    .dashboard-order-detail-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .dashboard-order-detail-actions {
                        flex-direction: column;
                    }

                    .dashboard-order-detail-actions .btn {
                        width: 100%;
                        text-align: center;
                    }

                    .dashboard-address-item,
                    .dashboard-payment-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .dashboard-address-set-default,
                    .dashboard-payment-set-default {
                        width: 100%;
                        text-align: center;
                    }

                    .dashboard-orders-body {
                        max-height: 400px;
                    }
                }

                @media (max-width: 576px) {
                    .dashboard-section {
                        padding: 10px 0 20px 0;
                    }

                    .dashboard-welcome-title {
                        font-size: var(--font-lg);
                    }

                    .dashboard-stat-number {
                        font-size: var(--font-lg);
                    }

                    .dashboard-stat-icon {
                        font-size: 28px;
                    }

                    .dashboard-orders-body {
                        max-height: 500px;
                    }
                }
            `}</style>
        </>
    );
};

export default Dashboard;