import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { menuAPI, cartAPI } from '../src/api';

const Popular = () => {
    const navigate = useNavigate();
    const [popularItems, setPopularItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    
    // ✅ Size selection modal states
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    useEffect(() => {
        fetchPopularItems();
        updateCartCount();
    }, []);

    const fetchPopularItems = async () => {
        setLoading(true);
        try {
            // ✅ Fetch items marked as popular by admin
            const response = await menuAPI.getAll({ isPopular: true, status: 'active' });
            if (response.data.status === 1) {
                const items = response.data.data || [];
                const popularItems = items.filter(item => item.isPopular === true);
                const sortedItems = popularItems.sort((a, b) => {
                    if (a.orders && b.orders) {
                        return b.orders - a.orders;
                    }
                    return 0;
                });
                setPopularItems(sortedItems.slice(0, 4)); // ✅ Show only top 4 on home page
            }
        } catch (error) {
            console.error('Popular Items Error:', error);
            // ✅ Fallback to static data if API fails
            setPopularItems([
                {
                    _id: '1',
                    name: 'Chicken Tikka Pizza',
                    description: 'Spicy chicken tikka with capsicum, onions, and mozzarella.',
                    price: 600,
                    image: '🍕',
                    imageUrl: '',
                    category: 'Pizza',
                    sizes: [
                        { name: 'Small', price: 600 },
                        { name: 'Medium', price: 1200 },
                        { name: 'Large', price: 1800 }
                    ],
                    rating: '4.9★',
                    orders: 342
                },
                {
                    _id: '2',
                    name: 'Double Zinger Burger',
                    description: 'Two crispy chicken patties with cheese and special sauce.',
                    price: 550,
                    image: '🍔',
                    imageUrl: '',
                    category: 'Burgers',
                    sizes: [
                        { name: 'Regular', price: 550 },
                        { name: 'Large', price: 750 }
                    ],
                    rating: '4.8★',
                    orders: 278
                },
                {
                    _id: '3',
                    name: 'B&D Special Shawarma',
                    description: 'Chicken shawarma with garlic sauce, pickles, and fries.',
                    price: 280,
                    image: '🌯',
                    imageUrl: '',
                    category: 'Shawarma',
                    sizes: [
                        { name: 'Regular', price: 280 },
                        { name: 'Large', price: 450 }
                    ],
                    rating: '4.9★',
                    orders: 401
                },
                {
                    _id: '4',
                    name: 'Creamy Pasta',
                    description: 'Creamy white sauce pasta with chicken and vegetables.',
                    price: 350,
                    image: '🍝',
                    imageUrl: '',
                    category: 'Pasta',
                    sizes: [
                        { name: 'Half', price: 350 },
                        { name: 'Full', price: 550 }
                    ],
                    rating: '4.7★',
                    orders: 189
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
                    setCartItems(response.data.data?.items || []);
                    window.dispatchEvent(new Event('cartUpdated'));
                }
            }
        } catch (error) {
            console.log('Cart not available');
        }
    };

    // ✅ Updated: Handle add to cart with size selection
    const handleAddToCart = (item) => {
        // Check if item has sizes
        if (item.sizes && item.sizes.length > 0) {
            // Show size selection modal
            setSelectedItem(item);
            setSelectedSize(item.sizes[0]); // Default to first size
            setShowSizeModal(true);
        } else {
            // Direct add for items without sizes
            addToCart(item, null);
        }
    };

    // ✅ Updated: Add to cart with selected size
    const addToCart = async (item, selectedSize) => {
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

            // Prepare cart item data
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
                setCartItems(response.data.data?.items || []);
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

    // ✅ Updated: Render price with sizes
    const renderPrice = (item) => {
        if (item.sizes && item.sizes.length > 0) {
            const prices = item.sizes.map(s => s.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            if (minPrice === maxPrice) {
                return <span className="fw-bold price-text">Rs. {minPrice}</span>;
            }
            return <span className="fw-bold price-text">Rs. {minPrice} - {maxPrice}</span>;
        }
        
        if (item.price !== undefined && item.price !== null) {
            return <span className="fw-bold price-text">Rs. {item.price}</span>;
        }
        
        return <span className="fw-bold price-text">Price unavailable</span>;
    };

    // ✅ Updated: Get size badges for display
    const renderSizeBadges = (item) => {
        if (!item.sizes || item.sizes.length === 0) return null;
        
        return (
            <div className="mt-1">
                {item.sizes.slice(0, 2).map((size, idx) => (
                    <Badge 
                        key={idx} 
                        className="size-badge"
                    >
                        {size.name}: Rs.{size.price}
                    </Badge>
                ))}
                {item.sizes.length > 2 && (
                    <Badge className="size-badge-more">
                        +{item.sizes.length - 2} more
                    </Badge>
                )}
            </div>
        );
    };

    const handleViewFullMenu = () => {
        navigate('/menu');
    };

    if (loading) {
        return (
            <section className="popular-section py-5">
                <Container>
                    <div className="section-header">
                        <Badge className="badge-primary-custom">CROWD FAVOURITES</Badge>
                        <h2>Most Ordered This Week</h2>
                        <p>The dishes regulars keep coming back for.</p>
                    </div>
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="danger" />
                    </div>
                </Container>
            </section>
        );
    }

    return (
        <>
            <section className="popular-section py-5">
                <Container>
                    {/* Section Header - Using theme classes */}
                    <div className="section-header">
                        <Badge className="badge-primary-custom">⭐ CROWD FAVOURITES</Badge>
                        <h2>Most Ordered This Week</h2>
                        <p>The dishes regulars keep coming back for.</p>
                    </div>

                    {/* Popular Items Grid */}
                    <Row className="g-4">
                        {popularItems.length === 0 ? (
                            <Col>
                                <div className="text-center py-4 text-secondary">
                                    <p>No popular items available at the moment.</p>
                                </div>
                            </Col>
                        ) : (
                            popularItems.map((item) => (
                                <Col key={item._id} lg={3} md={6} sm={6} xs={12}>
                                    <div className="popular-card h-100 rounded-4 shadow-sm overflow-hidden">
                                        {/* ✅ Image - Larger with better styling */}
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

                                        <div className="p-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <Badge className="category-badge">
                                                        {item.category?.toUpperCase() || 'ITEM'}
                                                    </Badge>
                                                    <h6 className="fw-bold mb-1 item-name">{item.name}</h6>
                                                    {item.description && (
                                                        <p className="item-description mb-0">{item.description}</p>
                                                    )}
                                                    {/* ✅ Show size badges with prices */}
                                                    {renderSizeBadges(item)}
                                                </div>
                                            </div>

                                            {/* Price & Add Button */}
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <span className="fw-bold fs-6 price-text">
                                                    {renderPrice(item)}
                                                </span>
                                                <Button 
                                                    className="btn-add-popular"
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

                    {/* View All Button */}
                    <div className="text-center mt-5">
                        <Button 
                            className="btn-view-all"
                            size="lg" 
                            onClick={handleViewFullMenu}
                        >
                            View Full Menu →
                        </Button>
                    </div>
                </Container>
            </section>

            {/* ✅ Size Selection Modal - Updated with theme */}
            <Modal show={showSizeModal} onHide={() => setShowSizeModal(false)} centered className="size-modal">
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
                                        className="modal-item-image"
                                    />
                                ) : (
                                    <div className="modal-item-emoji">
                                        {selectedItem.image || '🍕'}
                                    </div>
                                )}
                                <h5 className="fw-bold mt-2 modal-item-name">{selectedItem.name}</h5>
                                <p className="text-secondary small modal-item-desc">{selectedItem.description}</p>
                            </div>
                            <Form>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Choose Size:</Form.Label>
                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                        {selectedItem.sizes.map((size, idx) => (
                                            <Button
                                                key={idx}
                                                className={selectedSize?.name === size.name ? 'btn-size-selected' : 'btn-size-unselected'}
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
                    <Button className="btn-modal-cancel" onClick={() => setShowSizeModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        className="btn-modal-add"
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

            <style>{`
                /* ===== POPULAR SECTION ===== */
                .popular-section {
                    background: var(--light);
                    padding: 60px 0;
                }

                .popular-section .section-header {
                    text-align: center;
                    margin-bottom: var(--space-2xl);
                }

                .popular-section .section-header .badge {
                    font-size: var(--font-sm);
                    padding: 8px 24px;
                    border-radius: var(--radius-full);
                    margin-bottom: var(--space-md);
                    display: inline-block;
                }

                .popular-section .section-header h2 {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: var(--space-sm);
                }

                .popular-section .section-header p {
                    color: var(--text-secondary);
                    font-size: var(--font-lg);
                    max-width: 500px;
                    margin: 0 auto;
                }

                /* ===== POPULAR CARDS ===== */
                .popular-card {
                    background: var(--light-card);
                    transition: all var(--transition-normal) !important;
                    border-radius: var(--radius-lg) !important;
                    overflow: hidden;
                    border: 1px solid rgba(0, 0, 0, 0.05) !important;
                }

                .popular-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-lg) !important;
                }

                /* ===== IMAGE STYLES ===== */
                .popular-image-wrapper {
                    position: relative;
                    overflow: hidden;
                    height: 200px;
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
                    height: 200px;
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

                /* ===== CATEGORY BADGE ===== */
                .category-badge {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    font-size: 10px;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    margin-bottom: 4px;
                }

                /* ===== ITEM TEXT ===== */
                .item-name {
                    color: var(--text-primary);
                    font-size: var(--font-md);
                }

                .item-description {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                /* ===== SIZE BADGES ===== */
                .size-badge {
                    background: var(--light-dark) !important;
                    color: var(--text-primary) !important;
                    font-size: 9px;
                    padding: 4px 8px;
                    border-radius: var(--radius-full);
                    border: 1px solid var(--text-muted);
                    margin-right: 4px;
                    margin-bottom: 4px;
                }

                .size-badge-more {
                    background: var(--light-dark) !important;
                    color: var(--text-primary) !important;
                    font-size: 9px;
                    padding: 4px 8px;
                    border-radius: var(--radius-full);
                    border: 1px solid var(--text-muted);
                }

                /* ===== PRICE ===== */
                .price-text {
                    color: var(--primary) !important;
                }

                /* ===== ADD BUTTON ===== */
                .btn-add-popular {
                    background: var(--dark) !important;
                    color: white !important;
                    border: none !important;
                    padding: 6px 16px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .btn-add-popular:hover {
                    background: var(--primary) !important;
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== VIEW ALL BUTTON ===== */
                .btn-view-all {
                    background: transparent !important;
                    border: 2px solid var(--primary) !important;
                    color: var(--primary) !important;
                    padding: 12px 40px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .btn-view-all:hover {
                    background: var(--primary) !important;
                    color: white !important;
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== MODAL STYLES ===== */
                .size-modal .modal-content {
                    border-radius: var(--radius-lg);
                    background: var(--light-card);
                }

                .size-modal .modal-header {
                    border-bottom-color: rgba(0, 0, 0, 0.05);
                }

                .size-modal .modal-title {
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .modal-item-image {
                    width: 120px;
                    height: 120px;
                    object-fit: cover;
                    border-radius: var(--radius-md);
                }

                .modal-item-emoji {
                    font-size: 60px;
                }

                .modal-item-name {
                    color: var(--text-primary);
                }

                .modal-item-desc {
                    color: var(--text-secondary);
                }

                .btn-size-selected {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 20px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                }

                .btn-size-unselected {
                    background: transparent !important;
                    border: 2px solid var(--text-muted) !important;
                    color: var(--text-primary) !important;
                    padding: 8px 20px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .btn-size-unselected:hover {
                    border-color: var(--primary) !important;
                    color: var(--primary) !important;
                }

                .btn-modal-cancel {
                    background: transparent !important;
                    border: 2px solid var(--text-muted) !important;
                    color: var(--text-primary) !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                }

                .btn-modal-cancel:hover {
                    border-color: var(--danger) !important;
                    color: var(--danger) !important;
                }

                .btn-modal-add {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .btn-modal-add:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                .btn-modal-add:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .popular-card {
                    background: var(--dark-card);
                    border-color: rgba(255, 255, 255, 0.05) !important;
                }

                [data-theme="dark"] .popular-image-wrapper {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .popular-icon-wrapper {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .size-badge {
                    background: var(--dark-light) !important;
                    border-color: var(--text-muted);
                }

                [data-theme="dark"] .size-badge-more {
                    background: var(--dark-light) !important;
                    border-color: var(--text-muted);
                }

                [data-theme="dark"] .size-modal .modal-content {
                    background: var(--dark-card);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .popular-section {
                        padding: 50px 0;
                    }
                }

                @media (max-width: 768px) {
                    .popular-section {
                        padding: 40px 0;
                    }

                    .popular-section .section-header h2 {
                        font-size: var(--font-2xl);
                    }

                    .popular-image-wrapper {
                        height: 180px;
                    }

                    .popular-icon-wrapper {
                        height: 180px;
                    }

                    .popular-icon {
                        font-size: 50px;
                    }
                }

                @media (max-width: 576px) {
                    .popular-section {
                        padding: 30px 0;
                    }

                    .popular-section .section-header h2 {
                        font-size: var(--font-xl);
                    }

                    .popular-image-wrapper {
                        height: 160px;
                    }

                    .popular-icon-wrapper {
                        height: 160px;
                    }

                    .popular-icon {
                        font-size: 40px;
                    }

                    .popular-card .fs-6 {
                        font-size: var(--font-sm) !important;
                    }

                    .btn-add-popular {
                        padding: 4px 12px;
                        font-size: var(--font-xs);
                    }

                    .modal-item-image {
                        width: 80px;
                        height: 80px;
                    }

                    .modal-item-emoji {
                        font-size: 40px;
                    }

                    .btn-size-selected,
                    .btn-size-unselected {
                        padding: 6px 14px;
                        font-size: var(--font-xs);
                    }
                }
            `}</style>
        </>
    );
};

export default Popular;