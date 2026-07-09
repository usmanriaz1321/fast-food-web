import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { dealAPI, cartAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Deals = () => {
    const [filter, setFilter] = useState('all');
    const [cartCount, setCartCount] = useState(0);
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [deliveryFee, setDeliveryFee] = useState(100);
    const [total, setTotal] = useState(0);

    const categories = [
        { id: 'all', label: 'All Deals', icon: '🔥' },
        { id: 'classic', label: 'Classic', icon: '⭐' },
        { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
        { id: 'special', label: 'Special', icon: '🎯' }
    ];

    useEffect(() => {
        fetchDeals();
        updateCartCount();
    }, []);

    const fetchDeals = async () => {
        setLoading(true);
        try {
            const response = await dealAPI.getAll({ status: 'active' });
            if (response.data.status === 1) {
                setDeals(response.data.data || []);
            }
        } catch (error) {
            console.error('Deals Error:', error);
            toast.error('Failed to load deals');
        } finally {
            setLoading(false);
        }
    };

    const updateCartCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await cartAPI.get();
                if (response.data.status === 1) {
                    const items = response.data.data?.items || [];
                    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                    setCartCount(totalItems);
                    setCartItems(items);
                    
                    const cartSubtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
                    setSubtotal(cartSubtotal);
                    const fee = cartSubtotal > 600 ? 0 : 100;
                    setDeliveryFee(fee);
                    setTotal(cartSubtotal + fee);
                    
                    window.dispatchEvent(new Event('cartUpdated'));
                }
            }
        } catch (error) {
            console.error('Cart count error:', error);
        }
    };

    const handleAddToCart = async (deal) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.info('Please login to add items to cart', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
                return;
            }

            const existingItem = cartItems.find(item => 
                item.itemId === 'deal-' + deal._id
            );

            if (existingItem) {
                toast.info('⚠️ This deal is already in your cart!', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "colored",
                });
                return;
            }

            const response = await cartAPI.add({
                itemId: 'deal-' + deal._id,
                quantity: 1,
                name: deal.name,
                price: deal.price,
                image: deal.imageUrl || deal.image || '🎁',
                options: JSON.stringify({ deal: true, items: deal.items })
            });

            if (response.data.status === 1) {
                const items = response.data.data?.items || [];
                const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
                setCartCount(totalItems);
                setCartItems(items);
                
                const cartSubtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
                setSubtotal(cartSubtotal);
                const fee = cartSubtotal > 600 ? 0 : 100;
                setDeliveryFee(fee);
                setTotal(cartSubtotal + fee);
                
                window.dispatchEvent(new Event('cartUpdated'));
                toast.success(`✅ Added "${deal.name}" to cart!`, {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "colored",
                });
            }
        } catch (error) {
            console.error('Add to Cart Error:', error);
            toast.error(error.response?.data?.message || 'Failed to add to cart', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        }
    };

    const getDealBadgeColor = (category) => {
        const colors = {
            'family': 'warning',
            'classic': 'info',
            'special': 'danger'
        };
        return colors[category] || 'secondary';
    };

    const getDealIcon = (category) => {
        const icons = {
            'family': '👨‍👩‍👧‍👦',
            'classic': '⭐',
            'special': '🎯'
        };
        return icons[category] || '🔥';
    };

    const filteredDeals = filter === 'all' 
        ? deals 
        : deals.filter(deal => deal.category === filter);

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
            <section className="deals-page py-5">
                <Container>
                    {/* Header */}
                    <div className="deals-header">
                        <Badge className="deals-header-badge">🔥 SPECIAL OFFERS</Badge>
                        <h1 className="deals-header-title">Our Deals</h1>
                        <p className="deals-header-subtitle">Bundled combos, priced to feed everyone</p>
                        <div className="deals-header-contact">
                            <span className="text-secondary">📞 03002800707</span>
                            <span className="deals-header-divider">|</span>
                            <span className="text-secondary">03140000707</span>
                            <span className="deals-header-divider">|</span>
                            <span className="deals-header-free">Free Delivery up to Rs. 600</span>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="deals-filters">
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                className={`deals-filter-btn ${filter === cat.id ? 'active' : ''}`}
                                onClick={() => setFilter(cat.id)}
                            >
                                {cat.icon} {cat.label}
                            </Button>
                        ))}
                    </div>

                    {/* Deals Grid */}
                    <Row className="g-4">
                        {filteredDeals.length === 0 ? (
                            <Col>
                                <div className="text-center py-5">
                                    <p className="text-secondary">No deals found in this category.</p>
                                </div>
                            </Col>
                        ) : (
                            filteredDeals.map((deal) => {
                                const isFamily = deal.category === 'family';
                                return (
                                    <Col key={deal._id} lg={4} md={6} sm={6} xs={12}>
                                        <div 
                                            className={`deals-card ${isFamily ? 'deals-card-family' : ''}`}
                                        >
                                            {/* Category Badge */}
                                            <div className="deals-badge-wrapper">
                                                <Badge 
                                                    className={`deals-badge-${getDealBadgeColor(deal.category)}`}
                                                >
                                                    {getDealIcon(deal.category)} {deal.category?.toUpperCase() || 'DEAL'}
                                                </Badge>
                                                {isFamily && (
                                                    <Badge className="deals-badge-best">⭐ BEST VALUE</Badge>
                                                )}
                                            </div>
                                            
                                            {/* Deal Image */}
                                            {deal.imageUrl ? (
                                                <div className="deals-image-wrapper">
                                                    <img 
                                                        src={deal.imageUrl} 
                                                        alt={deal.name} 
                                                        className="deals-image"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="deals-image-placeholder">
                                                    {deal.image || '🎁'}
                                                </div>
                                            )}
                                            
                                            <div className="deals-content">
                                                <h5 className="deals-name">{deal.name}</h5>
                                                
                                                <div className="deals-description">
                                                    <span className="text-secondary">📋</span>
                                                    <p className="deals-desc-text">{deal.items}</p>
                                                </div>
                                                
                                                {deal.savings && (
                                                    <div className="deals-savings">
                                                        <Badge className="deals-savings-badge">
                                                            💰 Save Rs. {deal.savings}
                                                        </Badge>
                                                    </div>
                                                )}
                                                
                                                <div className="deals-price-row">
                                                    <div>
                                                        <span className="deals-price">Rs. {deal.price}</span>
                                                        {deal.originalPrice && (
                                                            <span className="deals-original-price">
                                                                Rs. {deal.originalPrice}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button 
                                                        className="deals-add-btn"
                                                        size="sm" 
                                                        onClick={() => handleAddToCart(deal)}
                                                        disabled={cartItems.some(item => item.itemId === 'deal-' + deal._id)}
                                                    >
                                                        {cartItems.some(item => item.itemId === 'deal-' + deal._id) ? '✓ Added' : 'Add +'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })
                        )}
                    </Row>

                    {/* Enhanced Cart Summary */}
                    <div className="deals-cart-summary">
                        <Container>
                            <Row className="align-items-center gy-2">
                                <Col lg={6} md={6} sm={12} xs={12}>
                                    <div className="deals-cart-info">
                                        <span className="fw-bold">🛒 Cart: <span className="deals-cart-count">{cartCount}</span> items</span>
                                        {cartCount > 0 && (
                                            <>
                                                <span className="deals-cart-divider">|</span>
                                                <span className="fw-semibold">Subtotal: Rs. {subtotal.toLocaleString()}</span>
                                                <span className="deals-cart-divider">|</span>
                                                <span className="fw-semibold">
                                                    Delivery: {deliveryFee === 0 ? 'Free' : `Rs. ${deliveryFee}`}
                                                </span>
                                                <span className="deals-cart-divider">|</span>
                                                <span className="deals-cart-total">Total: Rs. {total.toLocaleString()}</span>
                                            </>
                                        )}
                                    </div>
                                </Col>
                                <Col lg={6} md={6} sm={12} xs={12} className="text-end">
                                    <Button 
                                        className="deals-cart-btn"
                                        onClick={() => window.location.href = '/cart'}
                                        disabled={cartCount === 0}
                                    >
                                        {cartCount > 0 ? `View Cart →` : 'Cart Empty'}
                                    </Button>
                                </Col>
                            </Row>
                            {/* Free Delivery Progress */}
                            {cartCount > 0 && subtotal < 600 && (
                                <div className="deals-progress-section">
                                    <div className="deals-progress-labels">
                                        <small className="text-secondary">Free delivery at Rs. 600</small>
                                        <small className="text-secondary">Rs. {subtotal} / Rs. 600</small>
                                    </div>
                                    <ProgressBar 
                                        now={(subtotal / 600) * 100} 
                                        className="deals-progress-bar"
                                    />
                                    {subtotal > 0 && (
                                        <small className="deals-progress-message">
                                            💡 Add Rs. {(600 - subtotal).toLocaleString()} more for free delivery!
                                        </small>
                                    )}
                                </div>
                            )}
                            {cartCount > 0 && subtotal >= 600 && (
                                <div className="deals-free-delivery">
                                    <small className="text-success fw-bold">✅ Free delivery applied!</small>
                                </div>
                            )}
                        </Container>
                    </div>
                </Container>
            </section>
            <Footer />

            <style>{`
                /* ===== DEALS PAGE ===== */
                .deals-page {
                    background: var(--light);
                    min-height: 80vh;
                    padding-bottom: 100px;
                }

                /* ===== HEADER ===== */
                .deals-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .deals-header-badge {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-md);
                    margin-bottom: 12px;
                    display: inline-block;
                }

                .deals-header-title {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }

                .deals-header-subtitle {
                    color: var(--text-secondary);
                    font-size: var(--font-lg);
                }

                .deals-header-contact {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-top: 8px;
                }

                .deals-header-divider {
                    color: var(--text-secondary);
                }

                .deals-header-free {
                    color: var(--success);
                    font-weight: 700;
                }

                /* ===== FILTERS ===== */
                .deals-filters {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .deals-filter-btn {
                    padding: 8px 20px;
                    border-radius: var(--radius-full);
                    font-weight: 700;
                    border: 2px solid var(--text-secondary);
                    background: transparent;
                    color: var(--text-secondary);
                    transition: all var(--transition-normal);
                }

                .deals-filter-btn:hover {
                    transform: translateY(-2px);
                }

                .deals-filter-btn.active {
                    background: var(--primary-gradient);
                    border-color: var(--primary);
                    color: white;
                }

                .deals-filter-btn:not(.active):hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }

                /* ===== DEALS CARDS ===== */
                .deals-card {
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                    transition: all var(--transition-normal);
                    position: relative;
                    background: var(--light-card);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }

                .deals-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-lg) !important;
                }

                .deals-card-family {
                    background: linear-gradient(145deg, #FFF9F0, #FFF3E0);
                    border: 2px solid var(--secondary);
                }

                [data-theme="dark"] .deals-card-family {
                    background: linear-gradient(145deg, #2a1a0a, #3a2a1a);
                    border-color: var(--secondary);
                }

                /* ===== BADGES ===== */
                .deals-badge-wrapper {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    z-index: 2;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .deals-badge-warning {
                    background: var(--secondary) !important;
                    color: var(--dark) !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .deals-badge-info {
                    background: var(--info) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .deals-badge-danger {
                    background: var(--danger) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .deals-badge-secondary {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .deals-badge-best {
                    background: var(--danger) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                }

                /* ===== IMAGE ===== */
                .deals-image-wrapper {
                    height: 200px;
                    overflow: hidden;
                    background: var(--light-dark);
                    position: relative;
                }

                .deals-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform var(--transition-slow);
                }

                .deals-card:hover .deals-image {
                    transform: scale(1.05);
                }

                .deals-image-placeholder {
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 60px;
                    background: var(--light-dark);
                }

                /* ===== CONTENT ===== */
                .deals-content {
                    padding: 16px;
                }

                .deals-name {
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .deals-description {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .deals-desc-text {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 0;
                }

                .deals-savings {
                    margin-bottom: 8px;
                }

                .deals-savings-badge {
                    background: var(--success) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                }

                .deals-price-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                }

                .deals-price {
                    font-weight: 700;
                    font-size: var(--font-xl);
                    color: var(--primary);
                }

                .deals-original-price {
                    color: var(--text-secondary);
                    margin-left: 8px;
                    text-decoration: line-through;
                    font-size: var(--font-sm);
                }

                .deals-add-btn {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 6px 20px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .deals-add-btn:hover:not(:disabled) {
                    transform: scale(1.05);
                    box-shadow: var(--shadow-primary);
                }

                .deals-add-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                /* ===== CART SUMMARY ===== */
                .deals-cart-summary {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: var(--light-card);
                    padding: 12px 0;
                    border-top: 2px solid var(--secondary);
                    box-shadow: var(--shadow-lg);
                    z-index: 999;
                }

                .deals-cart-info {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 12px;
                }

                .deals-cart-count {
                    color: var(--primary);
                }

                .deals-cart-divider {
                    color: var(--text-secondary);
                }

                .deals-cart-total {
                    color: var(--primary);
                    font-weight: 700;
                }

                .deals-cart-btn {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .deals-cart-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                .deals-cart-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== PROGRESS ===== */
                .deals-progress-section {
                    margin-top: 8px;
                }

                .deals-progress-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }

                .deals-progress-bar {
                    height: 6px;
                    border-radius: var(--radius-full);
                    background-color: var(--light-dark);
                }

                .deals-progress-bar .progress-bar {
                    background-color: var(--primary) !important;
                    border-radius: var(--radius-full);
                }

                .deals-progress-message {
                    color: var(--success);
                    display: block;
                    margin-top: 4px;
                }

                .deals-free-delivery {
                    margin-top: 8px;
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .deals-card:not(.deals-card-family) {
                    background: var(--dark-card);
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .deals-image-wrapper,
                [data-theme="dark"] .deals-image-placeholder {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .deals-cart-summary {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .deals-progress-bar {
                    background-color: var(--dark-light);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .deals-page {
                        padding: 20px 0 120px 0;
                    }

                    .deals-header-title {
                        font-size: var(--font-2xl);
                    }

                    .deals-image-wrapper,
                    .deals-image-placeholder {
                        height: 160px;
                    }

                    .deals-badge-wrapper {
                        top: 8px;
                        left: 8px;
                    }

                    .deals-badge-warning,
                    .deals-badge-info,
                    .deals-badge-danger,
                    .deals-badge-secondary,
                    .deals-badge-best {
                        font-size: 10px;
                        padding: 4px 10px;
                    }

                    .deals-cart-info {
                        justify-content: center;
                        gap: 8px;
                    }

                    .deals-cart-divider {
                        display: none;
                    }

                    .deals-cart-summary .text-end {
                        text-align: center !important;
                    }

                    .deals-cart-btn {
                        width: 100%;
                    }
                }

                @media (max-width: 576px) {
                    .deals-page {
                        padding: 15px 0 120px 0;
                    }

                    .deals-header-title {
                        font-size: var(--font-xl);
                    }

                    .deals-header-subtitle {
                        font-size: var(--font-md);
                    }

                    .deals-image-wrapper,
                    .deals-image-placeholder {
                        height: 140px;
                    }

                    .deals-image-placeholder {
                        font-size: 40px;
                    }

                    .deals-price {
                        font-size: var(--font-lg);
                    }

                    .deals-content {
                        padding: 12px;
                    }

                    .deals-filter-btn {
                        padding: 6px 14px;
                        font-size: var(--font-sm);
                    }

                    .deals-cart-info {
                        flex-direction: column;
                        align-items: center;
                        gap: 4px;
                    }

                    .deals-cart-btn {
                        font-size: var(--font-sm);
                        padding: 6px 16px;
                    }
                }
            `}</style>
        </>
    );
};

export default Deals;