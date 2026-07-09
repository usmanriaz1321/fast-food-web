import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { dealAPI, cartAPI } from '../src/api';

const Deals = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // ✅ Fetch deals on page load
    useEffect(() => {
        fetchDeals();
        updateCartCount();
    }, []);

    const fetchDeals = async () => {
        setLoading(true);
        try {
            const response = await dealAPI.getAll({ status: 'active' });
            if (response.data.status === 1) {
                const items = response.data.data || [];
                // ✅ Sort deals: featured first, then by category
                const sortedDeals = items.sort((a, b) => {
                    if (a.badge && !b.badge) return -1;
                    if (!a.badge && b.badge) return 1;
                    return 0;
                });
                setDeals(sortedDeals.slice(0, 4)); // Show top 4 deals
            }
        } catch (error) {
            console.error('Deals Error:', error);
            // ✅ Fallback static data
            setDeals([
                {
                    _id: '1',
                    name: 'Family Feast',
                    items: '2 Large Pizzas + 1 Ltr Drink + 2 Sides',
                    price: 2200,
                    image: '🍕',
                    imageUrl: '',
                    badge: '⭐ BEST VALUE',
                    category: 'family'
                },
                {
                    _id: '2',
                    name: 'Shawarma Combo',
                    items: '2 Shawarmas + Fries + Drink',
                    price: 650,
                    image: '🌯',
                    imageUrl: '',
                    badge: '🔥 POPULAR',
                    category: 'classic'
                },
                {
                    _id: '3',
                    name: 'Burger Feast',
                    items: '2 Burgers + Fries + 2 Drinks',
                    price: 850,
                    image: '🍔',
                    imageUrl: '',
                    category: 'classic'
                },
                {
                    _id: '4',
                    name: 'Pasta Deal',
                    items: 'Pasta + Garlic Bread + Drink',
                    price: 550,
                    image: '🍝',
                    imageUrl: '',
                    category: 'classic'
                }
            ]);
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
                    const total = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                    setCartCount(total);
                    setCartItems(items);
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

            // ✅ Check if already in cart
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
                options: JSON.stringify({ 
                    deal: true, 
                    items: deal.items,
                    category: deal.category 
                })
            });

            if (response.data.status === 1) {
                const items = response.data.data?.items || [];
                const total = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
                setCartCount(total);
                setCartItems(items);
                window.dispatchEvent(new Event('cartUpdated'));
                toast.success(`✅ Added "${deal.name}" to cart!`, {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "colored",
                });
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.info('Please login to add items to cart', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            } else {
                toast.error('Failed to add to cart', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "colored",
                });
            }
        }
    };

    // ✅ Get deal icon based on category
    const getDealIcon = (category) => {
        const icons = {
            'family': '👨‍👩‍👧‍👦',
            'classic': '⭐',
            'special': '🎯'
        };
        return icons[category] || '🔥';
    };

    // ✅ Get badge color based on category
    const getBadgeColor = (category) => {
        const colors = {
            'family': 'warning',
            'classic': 'info',
            'special': 'danger'
        };
        return colors[category] || 'secondary';
    };

    if (loading) {
        return (
            <section className="deals-section py-5">
                <Container>
                    <div className="section-header">
                        <Badge className="badge-secondary-custom">🔥 TODAY'S TICKETS</Badge>
                        <h2>Deals Worth the Drive</h2>
                        <p>Bundled combos, priced to feed everyone from a solo order to the whole house.</p>
                    </div>
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="warning" />
                    </div>
                </Container>
            </section>
        );
    }

    return (
        <>
            <section className="deals-section py-5">
                <Container>
                    {/* Section Header - Using theme classes */}
                    <div className="section-header">
                        <Badge className="badge-secondary-custom">🔥 TODAY'S TICKETS</Badge>
                        <h2>Deals Worth the Drive</h2>
                        <p>Bundled combos, priced to feed everyone from a solo order to the whole house.</p>
                    </div>

                    {/* Deals Grid */}
                    <Row className="g-4">
                        {deals.length === 0 ? (
                            <Col>
                                <div className="text-center py-4 text-secondary">
                                    <p>No deals available at the moment.</p>
                                </div>
                            </Col>
                        ) : (
                            deals.map((deal, index) => {
                                const isFeatured = deal.badge && deal.badge.includes('BEST');
                                const isPopular = deal.badge && deal.badge.includes('POPULAR');
                                
                                return (
                                    <Col key={deal._id} lg={4} md={6} sm={6} xs={12}>
                                        <div 
                                            className={`deal-card rounded-4 shadow-sm h-100 overflow-hidden ${
                                                isFeatured ? 'featured-deal' : ''
                                            }`}
                                            style={{ 
                                                background: isFeatured ? 'var(--secondary-gradient)' : 'var(--light-card)',
                                                border: isFeatured ? `2px solid var(--secondary)` : '1px solid rgba(0,0,0,0.05)',
                                                transition: 'all var(--transition-normal)',
                                                position: 'relative'
                                            }}
                                        >
                                            {/* ✅ Badge on top */}
                                            {deal.badge && (
                                                <div className="deal-badge-wrapper">
                                                    <Badge 
                                                        className={`deal-badge-${isFeatured ? 'featured' : isPopular ? 'popular' : 'default'}`}
                                                    >
                                                        {isFeatured ? '⭐' : isPopular ? '🔥' : '🎯'} {deal.badge}
                                                    </Badge>
                                                    {deal.category && (
                                                        <Badge 
                                                            className={`deal-badge-${getBadgeColor(deal.category)}`}
                                                        >
                                                            {getDealIcon(deal.category)} {deal.category?.toUpperCase()}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {/* ✅ Deal Image - Larger */}
                                            {deal.imageUrl ? (
                                                <div className="deal-image-wrapper">
                                                    <img 
                                                        src={deal.imageUrl} 
                                                        alt={deal.name} 
                                                        className="deal-image"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="deal-image-placeholder">
                                                    {deal.image || '🎁'}
                                                </div>
                                            )}

                                            {/* Deal Content */}
                                            <div className="p-4">
                                                <div className="d-flex align-items-center gap-3 mb-2">
                                                    <span className="deal-number">
                                                        DEAL — {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    {deal.savings && (
                                                        <Badge className="deal-savings-badge">
                                                            💰 Save Rs. {deal.savings}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <h5 className="fw-bold mb-2 deal-name" style={{ 
                                                    color: isFeatured ? 'var(--dark)' : 'var(--primary)' 
                                                }}>
                                                    {deal.name}
                                                </h5>
                                                <div className="d-flex align-items-start gap-2 mb-3">
                                                    <span className="text-secondary">📋</span>
                                                    <p className="deal-description mb-0">{deal.items}</p>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <span className="fw-bold fs-4 deal-price" style={{ color: 'var(--primary)' }}>
                                                            Rs. {deal.price}
                                                        </span>
                                                        {deal.originalPrice && (
                                                            <span className="deal-original-price">
                                                                Rs. {deal.originalPrice}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button 
                                                        className={`deal-add-btn ${isFeatured ? 'btn-deal-featured' : 'btn-deal-default'}`}
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

                    {/* Cart Status */}
                    <div className="text-center mt-5">
                        <div className="cart-status-badge">
                            <span className="fw-bold">🛒 Cart Items: </span>
                            <span className="cart-count-badge">{cartCount}</span>
                        </div>
                    </div>
                </Container>
            </section>

            <style>{`
                /* ===== DEALS SECTION ===== */
                .deals-section {
                    background: var(--dark);
                    color: var(--text-light);
                    padding: 60px 0;
                }

                .deals-section .section-header {
                    text-align: center;
                    margin-bottom: var(--space-2xl);
                }

                .deals-section .section-header .badge {
                    font-size: var(--font-sm);
                    padding: 8px 24px;
                    border-radius: var(--radius-full);
                    margin-bottom: var(--space-md);
                    display: inline-block;
                }

                .deals-section .section-header h2 {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    color: var(--text-light);
                    margin-bottom: var(--space-sm);
                }

                .deals-section .section-header p {
                    color: var(--text-secondary);
                    font-size: var(--font-lg);
                    max-width: 500px;
                    margin: 0 auto;
                }

                /* ===== DEAL CARDS ===== */
                .deal-card {
                    transition: all var(--transition-normal) !important;
                    border-radius: var(--radius-lg) !important;
                    overflow: hidden;
                    background: var(--light-card);
                }

                .deal-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-xl) !important;
                }

                .featured-deal {
                    position: relative;
                    overflow: hidden;
                }

                .featured-deal::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(244, 168, 29, 0.15), transparent);
                    border-radius: 50%;
                    pointer-events: none;
                }

                /* ===== DEAL BADGES ===== */
                .deal-badge-wrapper {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    z-index: 2;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .deal-badge-featured {
                    background: var(--danger) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    letter-spacing: 0.5px;
                }

                .deal-badge-popular {
                    background: var(--secondary) !important;
                    color: var(--dark) !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    letter-spacing: 0.5px;
                }

                .deal-badge-default {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    letter-spacing: 0.5px;
                }

                .deal-badge-warning {
                    background: var(--secondary) !important;
                    color: var(--dark) !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    letter-spacing: 0.5px;
                }

                .deal-badge-info {
                    background: var(--info) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    letter-spacing: 0.5px;
                }

                .deal-badge-danger {
                    background: var(--danger) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    letter-spacing: 0.5px;
                }

                .deal-badge-secondary {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    letter-spacing: 0.5px;
                }

                /* ===== DEAL IMAGE ===== */
                .deal-image-wrapper {
                    height: 200px;
                    overflow: hidden;
                    background: var(--light-dark);
                    position: relative;
                }

                .deal-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform var(--transition-slow);
                }

                .deal-card:hover .deal-image {
                    transform: scale(1.05);
                }

                .deal-image-placeholder {
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 60px;
                    background: var(--light-dark);
                }

                /* ===== DEAL CONTENT ===== */
                .deal-number {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    font-weight: 700;
                }

                .deal-savings-badge {
                    background: var(--success) !important;
                    color: white !important;
                    font-size: 11px;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                }

                .deal-name {
                    font-size: var(--font-lg);
                    font-weight: 700;
                }

                .deal-description {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .deal-price {
                    font-weight: 700;
                    font-size: var(--font-xl);
                    color: var(--primary);
                }

                .deal-original-price {
                    color: var(--text-secondary);
                    margin-left: 8px;
                    text-decoration: line-through;
                    font-size: var(--font-sm);
                }

                /* ===== DEAL ADD BUTTONS ===== */
                .deal-add-btn {
                    padding: 6px 20px;
                    border-radius: var(--radius-full);
                    font-weight: 700;
                    border: none;
                    transition: all var(--transition-normal);
                }

                .deal-add-btn:hover {
                    transform: scale(1.05);
                }

                .deal-add-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-deal-featured {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                }

                .btn-deal-featured:hover {
                    box-shadow: var(--shadow-primary) !important;
                }

                .btn-deal-default {
                    background: var(--dark) !important;
                    color: white !important;
                }

                .btn-deal-default:hover {
                    background: var(--primary) !important;
                    box-shadow: var(--shadow-primary) !important;
                }

                /* ===== CART STATUS ===== */
                .cart-status-badge {
                    display: inline-block;
                    background: var(--light-card);
                    padding: 12px 24px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-md);
                }

                .cart-status-badge .fw-bold {
                    color: var(--text-primary);
                }

                .cart-count-badge {
                    display: inline-block;
                    background: var(--primary);
                    color: white;
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-md);
                    font-weight: 700;
                    margin-left: 8px;
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .deal-card:not(.featured-deal) {
                    background: var(--dark-card);
                    border-color: rgba(255, 255, 255, 0.05) !important;
                }

                [data-theme="dark"] .deal-image-wrapper {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .deal-image-placeholder {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .cart-status-badge {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .cart-status-badge .fw-bold {
                    color: var(--text-light);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .deals-section {
                        padding: 50px 0;
                    }
                }

                @media (max-width: 768px) {
                    .deals-section {
                        padding: 40px 0;
                    }

                    .deals-section .section-header h2 {
                        font-size: var(--font-2xl);
                    }

                    .deal-image-wrapper {
                        height: 160px;
                    }

                    .deal-image-placeholder {
                        height: 160px;
                        font-size: 50px;
                    }

                    .deal-badge-wrapper {
                        top: 8px;
                        left: 8px;
                    }

                    .deal-badge-featured,
                    .deal-badge-popular,
                    .deal-badge-default,
                    .deal-badge-warning,
                    .deal-badge-info,
                    .deal-badge-danger,
                    .deal-badge-secondary {
                        font-size: 10px;
                        padding: 4px 10px;
                    }

                    .deal-price {
                        font-size: var(--font-lg);
                    }

                    .cart-status-badge {
                        padding: 10px 20px;
                    }
                }

                @media (max-width: 576px) {
                    .deals-section {
                        padding: 30px 0;
                    }

                    .deals-section .section-header h2 {
                        font-size: var(--font-xl);
                    }

                    .deal-image-wrapper {
                        height: 140px;
                    }

                    .deal-image-placeholder {
                        height: 140px;
                        font-size: 40px;
                    }

                    .deal-price {
                        font-size: var(--font-md);
                    }

                    .deal-name {
                        font-size: var(--font-md);
                    }

                    .deal-description {
                        font-size: var(--font-xs);
                    }

                    .deal-add-btn {
                        padding: 4px 14px;
                        font-size: var(--font-xs);
                    }

                    .deal-card .p-4 {
                        padding: 15px !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Deals;