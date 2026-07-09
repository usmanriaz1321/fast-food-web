import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Nav, Spinner, Modal, Form } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { menuAPI, dealAPI, cartAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Menu = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [menuItems, setMenuItems] = useState([]);
    const [deals, setDeals] = useState([]);
    const [familyDeals, setFamilyDeals] = useState([]);
    
    // ✅ Size selection modal states
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    // ✅ Categories with icons (including new ones)
    const categories = [
        { id: 'all', label: 'All', icon: '📋' },
        { id: 'Pizza', label: 'Pizza', icon: '🍕' },
        { id: 'Shawarma', label: 'Shawarma', icon: '🌯' },
        { id: 'Burgers', label: 'Burgers', icon: '🍔' },
        { id: 'Pasta', label: 'Pasta', icon: '🍝' },
        { id: 'Pratha Rolls', label: 'Pratha Rolls', icon: '🫓' },
        { id: 'Sandwiches', label: 'Sandwiches', icon: '🥪' },
        { id: 'Sides', label: 'Sides', icon: '🍟' },
        { id: 'Salads', label: 'Salads', icon: '🥗' },
        { id: 'Drinks', label: 'Drinks', icon: '🥤' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const menuRes = await menuAPI.getAll({ status: 'active' });
            if (menuRes.data.status === 1) {
                setMenuItems(menuRes.data.data || []);
            }

            const dealsRes = await dealAPI.getAll({ status: 'active' });
            if (dealsRes.data.status === 1) {
                const allDeals = dealsRes.data.data || [];
                setFamilyDeals(allDeals.filter(d => d.category === 'family'));
                setDeals(allDeals.filter(d => d.category !== 'family'));
            }

            await updateCartCount();

        } catch (error) {
            console.error('Menu Error:', error);
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const updateCartCount = async () => {
        try {
            const cartRes = await cartAPI.get();
            if (cartRes.data.status === 1) {
                const items = cartRes.data.data?.items || [];
                const total = items.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(total);
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (error) {
            console.error('Cart count error:', error);
        }
    };

    // ✅ Updated: Handle add to cart with size selection
    const handleAddToCart = (item) => {
        if (item.sizes && item.sizes.length > 0) {
            setSelectedItem(item);
            setSelectedSize(item.sizes[0]);
            setShowSizeModal(true);
        } else {
            addToCart(item, null);
        }
    };

    // ✅ Updated: Add to cart with selected size
    const addToCart = async (item, selectedSize) => {
        try {
            const cartItem = {
                itemId: item._id,
                quantity: 1,
                name: selectedSize ? `${item.name} (${selectedSize.name})` : item.name,
                price: selectedSize ? selectedSize.price : item.price,
                image: item.imageUrl || item.image || '🍕',
                size: selectedSize ? selectedSize.name : null,
                options: selectedSize ? JSON.stringify({ size: selectedSize.name, sizePrice: selectedSize.price }) : ''
            };

            const response = await cartAPI.add(cartItem);
            if (response.data.status === 1) {
                const items = response.data.data?.items || [];
                const total = items.reduce((sum, i) => sum + i.quantity, 0);
                setCartCount(total);
                window.dispatchEvent(new Event('cartUpdated'));
                toast.success(`✅ Added "${cartItem.name}" to cart!`, {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "colored",
                });
                setShowSizeModal(false);
                setSelectedItem(null);
                setSelectedSize(null);
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

    const handleDealAdd = async (deal) => {
        try {
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
                const total = items.reduce((sum, i) => sum + i.quantity, 0);
                setCartCount(total);
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

    // ✅ Updated: Render price with sizes
    const renderPrice = (item) => {
        if (item.sizes && item.sizes.length > 0) {
            const prices = item.sizes.map(s => s.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            if (minPrice === maxPrice) {
                return <span className="fw-bold menu-price-text">Rs. {minPrice}</span>;
            }
            return <span className="fw-bold menu-price-text">Rs. {minPrice} - {maxPrice}</span>;
        }
        
        if (item.price !== undefined && item.price !== null) {
            return <span className="fw-bold menu-price-text">Rs. {item.price}</span>;
        }
        
        return <span className="fw-bold menu-price-text">Price unavailable</span>;
    };

    // ✅ Updated: Get size badges for display
    const renderSizeBadges = (item) => {
        if (!item.sizes || item.sizes.length === 0) return null;
        
        return (
            <div className="mt-1">
                {item.sizes.map((size, idx) => (
                    <Badge 
                        key={idx} 
                        className="menu-size-badge"
                    >
                        {size.name}: Rs.{size.price}
                    </Badge>
                ))}
            </div>
        );
    };

    const getFilteredItems = () => {
        if (activeCategory === 'all') {
            return menuItems;
        }
        return menuItems.filter(item => item.category === activeCategory);
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

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="menu-section py-5">
                <Container>
                    {/* Header */}
                    <div className="menu-header">
                        <Badge className="menu-header-badge">🍽️ OUR MENU</Badge>
                        <h1 className="menu-header-title">BiteDash</h1>
                        <p className="menu-header-subtitle">Spreading Friendly Khushiyan</p>
                        <div className="menu-header-contact">
                            <span className="text-secondary">📞 03002800707</span>
                            <span className="menu-header-divider">|</span>
                            <span className="text-secondary">03140000707</span>
                            <span className="menu-header-divider">|</span>
                            <span className="menu-header-free-delivery">Free Delivery up to Rs. 600</span>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="menu-categories">
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                className={`menu-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.icon} {cat.label}
                            </Button>
                        ))}
                    </div>

                    {/* Menu Items */}
                    <h3 className="menu-section-title">📋 Menu</h3>
                    {getFilteredItems().length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-secondary">No items found in this category.</p>
                        </div>
                    ) : (
                        <Row className="g-4">
                            {getFilteredItems().map((item) => (
                                <Col key={item._id} lg={3} md={6} sm={6} xs={12}>
                                    <Card className="menu-item-card">
                                        {/* Image */}
                                        {item.imageUrl ? (
                                            <div className="menu-image-wrapper">
                                                <Card.Img 
                                                    src={item.imageUrl} 
                                                    alt={item.name} 
                                                    className="menu-item-image"
                                                />
                                                {item.isPopular && (
                                                    <Badge className="menu-popular-badge">
                                                        ⭐ Popular
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="menu-image-placeholder">
                                                {item.image || '🍕'}
                                                {item.isPopular && (
                                                    <Badge className="menu-popular-badge">
                                                        ⭐ Popular
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <Card.Body className="p-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <Badge className="menu-category-badge">
                                                        {item.category?.toUpperCase()}
                                                    </Badge>
                                                    <h6 className="menu-item-name">{item.name}</h6>
                                                    {item.description && (
                                                        <p className="menu-item-desc">{item.description}</p>
                                                    )}
                                                    {renderSizeBadges(item)}
                                                </div>
                                            </div>
                                            <div className="menu-item-actions">
                                                <div>{renderPrice(item)}</div>
                                                <Button 
                                                    className="menu-add-btn"
                                                    size="sm" 
                                                    onClick={() => handleAddToCart(item)}
                                                >
                                                    Add +
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}

                    {/* Deals Section */}
                    {deals.length > 0 && (
                        <>
                            <h3 className="menu-section-title mt-5">🔥 Deals</h3>
                            <Row className="g-4 mb-4">
                                {deals.map((deal) => (
                                    <Col key={deal._id} lg={3} md={4} sm={6} xs={12}>
                                        <Card className="menu-deal-card">
                                            <Card.Body className="text-center p-3">
                                                {deal.imageUrl ? (
                                                    <img 
                                                        src={deal.imageUrl} 
                                                        alt={deal.name} 
                                                        className="menu-deal-image"
                                                    />
                                                ) : (
                                                    <div className="menu-deal-placeholder">
                                                        {deal.image || '🍕'}
                                                    </div>
                                                )}
                                                <Badge className="menu-deal-badge">{deal.name}</Badge>
                                                <h6 className="menu-deal-items">{deal.items}</h6>
                                                <div className="menu-deal-price">Rs. {deal.price}</div>
                                                <Button 
                                                    className="menu-deal-add-btn"
                                                    size="sm" 
                                                    onClick={() => handleDealAdd(deal)}
                                                >
                                                    Add +
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}

                    {/* Family Deals */}
                    {familyDeals.length > 0 && (
                        <>
                            <h3 className="menu-section-title mt-4">👨‍👩‍👧‍👦 Family Deals</h3>
                            <Row className="g-4 mb-4">
                                {familyDeals.map((deal, idx) => (
                                    <Col key={deal._id || idx} lg={6} md={6} xs={12}>
                                        <Card className="menu-family-deal-card">
                                            <Card.Body className="p-3">
                                                {deal.imageUrl ? (
                                                    <img 
                                                        src={deal.imageUrl} 
                                                        alt={deal.name} 
                                                        className="menu-family-deal-image"
                                                    />
                                                ) : (
                                                    <div className="menu-family-deal-placeholder">
                                                        {deal.image || '👨‍👩‍👧‍👦'}
                                                    </div>
                                                )}
                                                <Badge className="menu-family-deal-badge">⭐ BEST VALUE</Badge>
                                                <h6 className="menu-family-deal-name">{deal.name}</h6>
                                                <p className="menu-family-deal-desc">{deal.items}</p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="menu-family-deal-price">Rs. {deal.price}</span>
                                                    <Button 
                                                        className="menu-family-deal-add-btn"
                                                        size="sm" 
                                                        onClick={() => handleDealAdd(deal)}
                                                    >
                                                        Add +
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}

                    {/* Location */}
                    <div className="menu-location">
                        <p className="menu-location-text">
                            📍 Noor Aziz Jahan Chowk, Tehsil Harnoli, District Mianwali
                        </p>
                        <div className="menu-social-links">
                            <a href="#" className="menu-social-link" onClick={() => toast.info('📘 Follow us on Facebook!', { theme: "colored" })}>
                                📘
                            </a>
                            <a href="#" className="menu-social-link" onClick={() => toast.info('📷 Follow us on Instagram!', { theme: "colored" })}>
                                📷
                            </a>
                            <a href="#" className="menu-social-link" onClick={() => toast.info('🐦 Follow us on Twitter!', { theme: "colored" })}>
                                🐦
                            </a>
                        </div>
                    </div>

                    {/* Cart Summary */}
                    <div className="menu-cart-summary">
                        <span className="fw-bold">🛒 Cart Items: <span className="menu-cart-count">{cartCount}</span></span>
                        <Button className="menu-cart-btn" onClick={() => window.location.href = '/cart'}>
                            View Cart →
                        </Button>
                    </div>
                </Container>
            </section>

            {/* Size Selection Modal */}
            <Modal show={showSizeModal} onHide={() => setShowSizeModal(false)} centered className="menu-size-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Select Size</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedItem && (
                        <>
                            <div className="text-center mb-3">
                                {selectedItem.imageUrl ? (
                                    <img 
                                        src={selectedItem.imageUrl} 
                                        alt={selectedItem.name} 
                                        className="menu-modal-image"
                                    />
                                ) : (
                                    <div className="menu-modal-emoji">
                                        {selectedItem.image || '🍕'}
                                    </div>
                                )}
                                <h5 className="menu-modal-name">{selectedItem.name}</h5>
                            </div>
                            <Form>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Choose Size:</Form.Label>
                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                        {selectedItem.sizes.map((size, idx) => (
                                            <Button
                                                key={idx}
                                                className={selectedSize?.name === size.name ? 'menu-size-btn-selected' : 'menu-size-btn-unselected'}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size.name} - Rs. {size.price}
                                            </Button>
                                        ))}
                                    </div>
                                </Form.Group>
                            </Form>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="menu-modal-cancel" onClick={() => setShowSizeModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        className="menu-modal-add"
                        onClick={() => {
                            if (selectedItem && selectedSize) {
                                addToCart(selectedItem, selectedSize);
                            }
                        }}
                        disabled={!selectedSize}
                    >
                        Add to Cart
                    </Button>
                </Modal.Footer>
            </Modal>

            <Footer />

            <style>{`
                /* ===== MENU SECTION ===== */
                .menu-section {
                    background: var(--light);
                    padding-bottom: 80px;
                }

                /* ===== HEADER ===== */
                .menu-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .menu-header-badge {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-md);
                    margin-bottom: 12px;
                    display: inline-block;
                }

                .menu-header-title {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }

                .menu-header-subtitle {
                    color: var(--text-secondary);
                    font-size: var(--font-lg);
                }

                .menu-header-contact {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-top: 8px;
                }

                .menu-header-divider {
                    color: var(--text-secondary);
                }

                .menu-header-free-delivery {
                    color: var(--success);
                    font-weight: 700;
                }

                /* ===== CATEGORIES ===== */
                .menu-categories {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .menu-category-btn {
                    padding: 8px 20px;
                    border-radius: var(--radius-full);
                    font-weight: 700;
                    border: 2px solid var(--text-secondary);
                    background: transparent;
                    color: var(--text-secondary);
                    transition: all var(--transition-normal);
                }

                .menu-category-btn:hover {
                    transform: translateY(-2px);
                }

                .menu-category-btn.active {
                    background: var(--primary-gradient);
                    border-color: var(--primary);
                    color: white;
                }

                .menu-category-btn:not(.active):hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }

                /* ===== SECTION TITLE ===== */
                .menu-section-title {
                    font-weight: 700;
                    margin-top: 24px;
                    margin-bottom: 16px;
                    text-align: center;
                    color: var(--text-primary);
                }

                /* ===== MENU ITEM CARD ===== */
                .menu-item-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                    transition: all var(--transition-normal);
                }

                .menu-item-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-hover) !important;
                }

                /* ===== IMAGE ===== */
                .menu-image-wrapper {
                    position: relative;
                    overflow: hidden;
                    height: 220px;
                    background: var(--light-dark);
                }

                .menu-item-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform var(--transition-slow);
                }

                .menu-item-card:hover .menu-item-image {
                    transform: scale(1.08);
                }

                .menu-image-placeholder {
                    height: 220px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 60px;
                    background: var(--light-dark);
                    position: relative;
                }

                .menu-popular-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    padding: 6px 14px;
                    font-size: var(--font-xs);
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-sm);
                    z-index: 2;
                    background: var(--secondary-gradient) !important;
                    color: var(--dark) !important;
                }

                /* ===== CATEGORY BADGE ===== */
                .menu-category-badge {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    font-size: 10px;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    margin-bottom: 4px;
                }

                /* ===== ITEM TEXT ===== */
                .menu-item-name {
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .menu-item-desc {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 0;
                }

                /* ===== SIZE BADGES ===== */
                .menu-size-badge {
                    background: var(--light-dark) !important;
                    color: var(--text-primary) !important;
                    font-size: 9px;
                    padding: 4px 8px;
                    border-radius: var(--radius-full);
                    border: 1px solid var(--text-muted);
                    margin-right: 4px;
                    margin-bottom: 4px;
                }

                /* ===== PRICE ===== */
                .menu-price-text {
                    color: var(--primary) !important;
                }

                /* ===== ADD BUTTON ===== */
                .menu-item-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                }

                .menu-add-btn {
                    background: var(--dark) !important;
                    color: white !important;
                    border: none !important;
                    padding: 4px 16px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .menu-add-btn:hover {
                    background: var(--primary) !important;
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== DEAL CARDS ===== */
                .menu-deal-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                    transition: all var(--transition-normal);
                }

                .menu-deal-card:hover {
                    transform: translateY(-6px);
                    box-shadow: var(--shadow-md) !important;
                }

                .menu-deal-image {
                    width: 100%;
                    height: 160px;
                    object-fit: cover;
                    border-radius: var(--radius-sm);
                    margin-bottom: 12px;
                }

                .menu-deal-placeholder {
                    height: 160px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 60px;
                    background: var(--light-dark);
                    border-radius: var(--radius-sm);
                    margin-bottom: 12px;
                }

                .menu-deal-badge {
                    background: var(--secondary-gradient) !important;
                    color: var(--dark) !important;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .menu-deal-items {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 4px;
                }

                .menu-deal-price {
                    color: var(--primary);
                    font-weight: 700;
                    font-size: var(--font-xl);
                }

                .menu-deal-add-btn {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 4px 16px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    margin-top: 8px;
                    transition: all var(--transition-normal);
                }

                .menu-deal-add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== FAMILY DEAL CARDS ===== */
                .menu-family-deal-card {
                    border: 2px solid var(--secondary) !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                    background: linear-gradient(135deg, #fff9f0 0%, #fff3e0 100%);
                    transition: all var(--transition-normal);
                }

                .menu-family-deal-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 12px 40px rgba(244, 168, 29, 0.2) !important;
                }

                [data-theme="dark"] .menu-family-deal-card {
                    background: linear-gradient(135deg, #2a1a0a 0%, #3a2a1a 100%);
                }

                .menu-family-deal-image {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    border-radius: var(--radius-sm);
                    margin-bottom: 12px;
                }

                .menu-family-deal-placeholder {
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 70px;
                    background: var(--light-dark);
                    border-radius: var(--radius-sm);
                    margin-bottom: 12px;
                }

                .menu-family-deal-badge {
                    background: var(--danger) !important;
                    color: white !important;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .menu-family-deal-name {
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .menu-family-deal-desc {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 8px;
                }

                .menu-family-deal-price {
                    color: var(--primary);
                    font-weight: 700;
                    font-size: var(--font-xl);
                }

                .menu-family-deal-add-btn {
                    background: var(--secondary-gradient) !important;
                    color: var(--dark) !important;
                    border: none !important;
                    padding: 4px 16px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .menu-family-deal-add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(244, 168, 29, 0.4);
                }

                /* ===== LOCATION ===== */
                .menu-location {
                    text-align: center;
                    margin-top: 32px;
                    padding: 16px;
                    background: var(--light-dark);
                    border-radius: var(--radius-lg);
                }

                .menu-location-text {
                    color: var(--text-secondary);
                    margin-bottom: 0;
                }

                .menu-social-links {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 8px;
                }

                .menu-social-link {
                    color: var(--text-secondary);
                    font-size: var(--font-xl);
                    text-decoration: none;
                    transition: all var(--transition-normal);
                }

                .menu-social-link:hover {
                    color: var(--secondary);
                    transform: translateY(-3px);
                }

                /* ===== CART SUMMARY ===== */
                .menu-cart-summary {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: var(--light-card);
                    padding: 12px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 2px solid var(--secondary);
                    box-shadow: var(--shadow-lg);
                    z-index: 999;
                }

                .menu-cart-count {
                    color: var(--primary);
                }

                .menu-cart-btn {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .menu-cart-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== MODAL ===== */
                .menu-size-modal .modal-content {
                    border-radius: var(--radius-lg);
                    background: var(--light-card);
                }

                .menu-modal-image {
                    width: 120px;
                    height: 120px;
                    object-fit: cover;
                    border-radius: var(--radius-md);
                }

                .menu-modal-emoji {
                    font-size: 60px;
                }

                .menu-modal-name {
                    font-weight: 700;
                    margin-top: 8px;
                    color: var(--text-primary);
                }

                .menu-size-btn-selected {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 20px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                }

                .menu-size-btn-unselected {
                    background: transparent !important;
                    border: 2px solid var(--text-muted) !important;
                    color: var(--text-primary) !important;
                    padding: 8px 20px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .menu-size-btn-unselected:hover {
                    border-color: var(--primary) !important;
                    color: var(--primary) !important;
                }

                .menu-modal-cancel {
                    background: transparent !important;
                    border: 2px solid var(--text-muted) !important;
                    color: var(--text-primary) !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                }

                .menu-modal-cancel:hover {
                    border-color: var(--danger) !important;
                    color: var(--danger) !important;
                }

                .menu-modal-add {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .menu-modal-add:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                .menu-modal-add:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .menu-item-card,
                [data-theme="dark"] .menu-deal-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .menu-image-wrapper,
                [data-theme="dark"] .menu-image-placeholder,
                [data-theme="dark"] .menu-deal-placeholder,
                [data-theme="dark"] .menu-family-deal-placeholder {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .menu-size-badge {
                    background: var(--dark-light) !important;
                    border-color: var(--text-muted);
                }

                [data-theme="dark"] .menu-size-modal .modal-content {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .menu-cart-summary {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .menu-location {
                    background: var(--dark-light);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .menu-section {
                        padding: 20px 0 80px 0;
                    }

                    .menu-header-title {
                        font-size: var(--font-2xl);
                    }

                    .menu-image-wrapper,
                    .menu-image-placeholder {
                        height: 180px;
                    }

                    .menu-item-image {
                        height: 180px;
                    }

                    .menu-deal-image,
                    .menu-deal-placeholder {
                        height: 130px;
                    }

                    .menu-family-deal-image,
                    .menu-family-deal-placeholder {
                        height: 160px;
                    }

                    .menu-category-btn {
                        padding: 6px 14px;
                        font-size: var(--font-sm);
                    }

                    .menu-cart-summary {
                        padding: 10px 16px;
                    }
                }

                @media (max-width: 576px) {
                    .menu-section {
                        padding: 15px 0 80px 0;
                    }

                    .menu-header-title {
                        font-size: var(--font-xl);
                    }

                    .menu-header-subtitle {
                        font-size: var(--font-md);
                    }

                    .menu-image-wrapper,
                    .menu-image-placeholder {
                        height: 160px;
                    }

                    .menu-item-image {
                        height: 160px;
                    }

                    .menu-image-placeholder {
                        font-size: 40px;
                    }

                    .menu-deal-price,
                    .menu-family-deal-price {
                        font-size: var(--font-lg);
                    }

                    .menu-cart-summary {
                        flex-direction: column;
                        gap: 8px;
                        text-align: center;
                    }

                    .menu-cart-btn {
                        width: 100%;
                        text-align: center;
                    }
                }
            `}</style>
        </>
    );
};

export default Menu;