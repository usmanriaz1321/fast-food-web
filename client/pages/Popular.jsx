import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { menuAPI, cartAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Popular = () => {
    const [filter, setFilter] = useState('all');
    const [cartCount, setCartCount] = useState(0);
    const [popularItems, setPopularItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ✅ Size selection modal states
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    const categories = [
        { id: 'all', label: 'All Items' },
        { id: 'Pizza', label: 'Pizza' },
        { id: 'Burgers', label: 'Burgers' },
        { id: 'Shawarma', label: 'Shawarma' },
        { id: 'Pasta', label: 'Pasta' },
        { id: 'Pratha Rolls', label: 'Pratha Rolls' },
        { id: 'Sandwiches', label: 'Sandwiches' },
        { id: 'Sides', label: 'Sides' },
        { id: 'Salads', label: 'Salads' },
        { id: 'Drinks', label: 'Drinks' }
    ];

    useEffect(() => {
        fetchPopularItems();
        updateCartCount();
    }, []);

    const fetchPopularItems = async () => {
        setLoading(true);
        try {
            const response = await menuAPI.getAll({ isPopular: true, status: 'active' });
            if (response.data.status === 1) {
                const popularItems = response.data.data || [];
                setPopularItems(popularItems.filter(item => item.isPopular === true));
            }
        } catch (error) {
            console.error('Popular Items Error:', error);
            toast.error('Failed to load popular items');
        } finally {
            setLoading(false);
        }
    };

    const updateCartCount = async () => {
        try {
            const response = await cartAPI.get();
            if (response.data.status === 1) {
                const items = response.data.data?.items || [];
                const total = items.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(total);
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (error) {
            console.error('Cart count error:', error);
        }
    };

    const handleAddToCart = (item) => {
        if (item.sizes && item.sizes.length > 0) {
            setSelectedItem(item);
            setSelectedSize(item.sizes[0]);
            setShowSizeModal(true);
        } else {
            addToCart(item, null);
        }
    };

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

    const renderPrice = (item) => {
        if (item.sizes && item.sizes.length > 0) {
            const prices = item.sizes.map(s => s.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            if (minPrice === maxPrice) {
                return <span className="fw-bold popular-price-text">Rs. {minPrice}</span>;
            }
            return <span className="fw-bold popular-price-text">Rs. {minPrice} - {maxPrice}</span>;
        }
        
        if (item.price !== undefined && item.price !== null) {
            return <span className="fw-bold popular-price-text">Rs. {item.price}</span>;
        }
        
        return <span className="fw-bold popular-price-text">Price unavailable</span>;
    };

    const renderSizeBadges = (item) => {
        if (!item.sizes || item.sizes.length === 0) return null;
        
        return (
            <div className="mt-1">
                {item.sizes.map((size, idx) => (
                    <Badge 
                        key={idx} 
                        className="popular-size-badge"
                    >
                        {size.name}: Rs.{size.price}
                    </Badge>
                ))}
            </div>
        );
    };

    const filteredItems = filter === 'all' 
        ? popularItems 
        : popularItems.filter(item => item.category === filter);

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
            <section className="popular-page py-5">
                <Container>
                    {/* Header */}
                    <div className="popular-header">
                        <Badge className="popular-header-badge">⭐ CROWD FAVOURITES</Badge>
                        <h1 className="popular-header-title">Most Popular Items</h1>
                        <p className="popular-header-subtitle">The dishes regulars keep coming back for</p>
                    </div>

                    {/* Filters */}
                    <div className="popular-filters">
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                className={`popular-filter-btn ${filter === cat.id ? 'active' : ''}`}
                                onClick={() => setFilter(cat.id)}
                            >
                                {cat.label}
                            </Button>
                        ))}
                    </div>

                    {/* Popular Items Grid */}
                    <Row className="g-4">
                        {filteredItems.length === 0 ? (
                            <Col>
                                <div className="text-center py-5">
                                    <p className="text-secondary">No popular items found in this category.</p>
                                </div>
                            </Col>
                        ) : (
                            filteredItems.map((item) => (
                                <Col key={item._id} lg={3} md={6} sm={6} xs={12}>
                                    <div className="popular-card">
                                        {/* Image */}
                                        {item.imageUrl ? (
                                            <div className="popular-image-wrapper">
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.name} 
                                                    className="popular-image"
                                                />
                                                <Badge className="popular-badge">
                                                    ⭐ Popular
                                                </Badge>
                                            </div>
                                        ) : (
                                            <div className="popular-icon-wrapper">
                                                <div className="popular-icon">
                                                    {item.image || '🍕'}
                                                </div>
                                                <Badge className="popular-badge">
                                                    ⭐ Popular
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="popular-content">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <Badge className="popular-category-badge">
                                                        {item.category?.toUpperCase()}
                                                    </Badge>
                                                    <h6 className="popular-item-name">{item.name}</h6>
                                                    {item.description && (
                                                        <p className="popular-item-desc">{item.description}</p>
                                                    )}
                                                    {renderSizeBadges(item)}
                                                </div>
                                            </div>
                                            <div className="popular-item-actions">
                                                <span className="fw-bold fs-6 popular-price-text">
                                                    {renderPrice(item)}
                                                </span>
                                                <Button 
                                                    className="popular-add-btn"
                                                    size="sm" 
                                                    onClick={() => handleAddToCart(item)}
                                                >
                                                    Add +
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            ))
                        )}
                    </Row>

                    {/* Cart Summary */}
                    <div className="popular-cart-summary">
                        <span className="fw-bold">🛒 Cart Items: <span className="popular-cart-count">{cartCount}</span></span>
                        <Button className="popular-cart-btn" onClick={() => window.location.href = '/cart'}>
                            View Cart →
                        </Button>
                    </div>
                </Container>
            </section>

            {/* Size Selection Modal */}
            <Modal show={showSizeModal} onHide={() => setShowSizeModal(false)} centered className="popular-size-modal">
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
                                        className="popular-modal-image"
                                    />
                                ) : (
                                    <div className="popular-modal-emoji">
                                        {selectedItem.image || '🍕'}
                                    </div>
                                )}
                                <h5 className="popular-modal-name">{selectedItem.name}</h5>
                            </div>
                            <Form>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Choose Size:</Form.Label>
                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                        {selectedItem.sizes.map((size, idx) => (
                                            <Button
                                                key={idx}
                                                className={selectedSize?.name === size.name ? 'popular-size-selected' : 'popular-size-unselected'}
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
                    <Button className="popular-modal-cancel" onClick={() => setShowSizeModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        className="popular-modal-add"
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
                /* ===== POPULAR PAGE ===== */
                .popular-page {
                    background: var(--light);
                    min-height: 80vh;
                    padding-bottom: 80px;
                }

                /* ===== HEADER ===== */
                .popular-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .popular-header-badge {
                    background: var(--secondary-gradient) !important;
                    color: var(--dark) !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-md);
                    margin-bottom: 12px;
                    display: inline-block;
                }

                .popular-header-title {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }

                .popular-header-subtitle {
                    color: var(--text-secondary);
                    font-size: var(--font-lg);
                }

                /* ===== FILTERS ===== */
                .popular-filters {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .popular-filter-btn {
                    padding: 8px 20px;
                    border-radius: var(--radius-full);
                    font-weight: 700;
                    border: 2px solid var(--text-secondary);
                    background: transparent;
                    color: var(--text-secondary);
                    transition: all var(--transition-normal);
                }

                .popular-filter-btn:hover {
                    transform: translateY(-2px);
                }

                .popular-filter-btn.active {
                    background: var(--primary-gradient);
                    border-color: var(--primary);
                    color: white;
                }

                .popular-filter-btn:not(.active):hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }

                /* ===== POPULAR CARDS ===== */
                .popular-card {
                    background: var(--light-card);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                    transition: all var(--transition-normal);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }

                .popular-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-lg) !important;
                }

                /* ===== IMAGE ===== */
                .popular-image-wrapper {
                    position: relative;
                    overflow: hidden;
                    height: 220px;
                    background: var(--light-dark);
                }

                .popular-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform var(--transition-slow);
                }

                .popular-card:hover .popular-image {
                    transform: scale(1.08);
                }

                .popular-icon-wrapper {
                    position: relative;
                    height: 220px;
                    background: var(--light-dark);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .popular-icon {
                    font-size: 60px;
                    transition: all var(--transition-normal);
                }

                .popular-card:hover .popular-icon {
                    transform: scale(1.1) rotate(-3deg);
                }

                /* ===== POPULAR BADGE ===== */
                .popular-badge {
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

                /* ===== CONTENT ===== */
                .popular-content {
                    padding: 12px 16px 16px;
                }

                .popular-category-badge {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    font-size: 10px;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    margin-bottom: 4px;
                }

                .popular-item-name {
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .popular-item-desc {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 0;
                }

                /* ===== SIZE BADGES ===== */
                .popular-size-badge {
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
                .popular-price-text {
                    color: var(--primary) !important;
                }

                /* ===== ADD BUTTON ===== */
                .popular-item-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                }

                .popular-add-btn {
                    background: var(--dark) !important;
                    color: white !important;
                    border: none !important;
                    padding: 4px 16px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .popular-add-btn:hover {
                    background: var(--primary) !important;
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== CART SUMMARY ===== */
                .popular-cart-summary {
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

                .popular-cart-count {
                    color: var(--primary);
                }

                .popular-cart-btn {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .popular-cart-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== MODAL ===== */
                .popular-size-modal .modal-content {
                    border-radius: var(--radius-lg);
                    background: var(--light-card);
                }

                .popular-modal-image {
                    width: 120px;
                    height: 120px;
                    object-fit: cover;
                    border-radius: var(--radius-md);
                }

                .popular-modal-emoji {
                    font-size: 60px;
                }

                .popular-modal-name {
                    font-weight: 700;
                    margin-top: 8px;
                    color: var(--text-primary);
                }

                .popular-size-selected {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 20px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                }

                .popular-size-unselected {
                    background: transparent !important;
                    border: 2px solid var(--text-muted) !important;
                    color: var(--text-primary) !important;
                    padding: 8px 20px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .popular-size-unselected:hover {
                    border-color: var(--primary) !important;
                    color: var(--primary) !important;
                }

                .popular-modal-cancel {
                    background: transparent !important;
                    border: 2px solid var(--text-muted) !important;
                    color: var(--text-primary) !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                }

                .popular-modal-cancel:hover {
                    border-color: var(--danger) !important;
                    color: var(--danger) !important;
                }

                .popular-modal-add {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .popular-modal-add:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                .popular-modal-add:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .popular-card {
                    background: var(--dark-card);
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .popular-image-wrapper,
                [data-theme="dark"] .popular-icon-wrapper {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .popular-size-badge {
                    background: var(--dark-light) !important;
                    border-color: var(--text-muted);
                }

                [data-theme="dark"] .popular-size-modal .modal-content {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .popular-cart-summary {
                    background: var(--dark-card);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .popular-page {
                        padding: 20px 0 80px 0;
                    }

                    .popular-header-title {
                        font-size: var(--font-2xl);
                    }

                    .popular-image-wrapper,
                    .popular-icon-wrapper {
                        height: 180px;
                    }

                    .popular-icon {
                        font-size: 50px;
                    }

                    .popular-filter-btn {
                        padding: 6px 14px;
                        font-size: var(--font-sm);
                    }

                    .popular-cart-summary {
                        padding: 10px 16px;
                    }
                }

                @media (max-width: 576px) {
                    .popular-page {
                        padding: 15px 0 80px 0;
                    }

                    .popular-header-title {
                        font-size: var(--font-xl);
                    }

                    .popular-header-subtitle {
                        font-size: var(--font-md);
                    }

                    .popular-image-wrapper,
                    .popular-icon-wrapper {
                        height: 160px;
                    }

                    .popular-icon {
                        font-size: 40px;
                    }

                    .popular-add-btn {
                        padding: 4px 12px;
                        font-size: var(--font-xs);
                    }

                    .popular-cart-summary {
                        flex-direction: column;
                        gap: 8px;
                        text-align: center;
                    }

                    .popular-cart-btn {
                        width: 100%;
                        text-align: center;
                    }

                    .popular-modal-image {
                        width: 80px;
                        height: 80px;
                    }

                    .popular-modal-emoji {
                        font-size: 40px;
                    }

                    .popular-size-selected,
                    .popular-size-unselected {
                        padding: 6px 14px;
                        font-size: var(--font-xs);
                    }
                }
            `}</style>
        </>
    );
};

export default Popular;