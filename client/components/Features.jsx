import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { categoryAPI } from '../src/api';

const Features = () => {
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const features = [
        { icon: '🚀', title: 'Fast Delivery', desc: '30-45 min average delivery time in Harnoli' },
        { icon: '💰', title: 'Cash on Delivery', desc: 'Pay when you receive your order' },
        { icon: '🔥', title: 'Freshly Made', desc: 'Cooked fresh with premium ingredients' },
        { icon: '⭐', title: 'Family Deals', desc: 'Special combos for the whole family' },
    ];

    // ✅ Fetch categories from API
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryAPI.getAll();
            if (response.data.status === 1) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Categories Error:', error);
            // ✅ Fallback to static data if API fails
            setCategories([
                { _id: '1', name: 'Pizza', icon: '🍕', count: '12 items', color: '#FBE3B8' },
                { _id: '2', name: 'Burgers', icon: '🍔', count: '8 items', color: '#F7D6C4' },
                { _id: '3', name: 'Shawarma', icon: '🌯', count: '6 items', color: '#E8D9C4' },
                { _id: '4', name: 'Pratha Rolls', icon: '🫓', count: '5 items', color: '#DCE8D1' },
                { _id: '5', name: 'Pasta', icon: '🍝', count: '4 items', color: '#F0E6D3' },
                { _id: '6', name: 'Fries & Sides', icon: '🍟', count: '7 items', color: '#F5E6D3' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category) => {
        toast.info(`🍽️ Exploring ${category.name} menu...`, {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
        });
    };

    if (loading) {
        return (
            <section className="features-section py-5">
                <Container>
                    <div className="section-header">
                        <Badge className="badge-primary-custom">BROWSE</Badge>
                        <h2>What are you craving?</h2>
                        <p>Six categories, one kitchen — everything made to order with love.</p>
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
            <section className="features-section py-5">
                <Container>
                    {/* Section Header - Using theme classes */}
                    <div className="section-header">
                        <Badge className="badge-primary-custom">BROWSE</Badge>
                        <h2>What are you craving?</h2>
                        <p>{categories.length} categories, one kitchen — everything made to order with love.</p>
                    </div>

                    {/* Categories Grid */}
                    <Row className="g-4">
                        {categories.length === 0 ? (
                            <Col>
                                <div className="text-center py-4">
                                    <p className="text-secondary">No categories available.</p>
                                </div>
                            </Col>
                        ) : (
                            categories.map((category) => (
                                <Col key={category._id} lg={4} md={6} sm={12}>
                                    {category.status === 'active' && (
                                        <Card 
                                            className="category-card border-0 text-center h-100 shadow-sm"
                                            style={{ 
                                                background: hoveredCategory === category._id ? 'var(--light-dark)' : 'var(--light-card)',
                                                transition: 'all var(--transition-normal)',
                                                cursor: 'pointer',
                                                border: hoveredCategory === category._id ? `2px solid var(--primary)` : '2px solid transparent'
                                            }}
                                            onMouseEnter={() => setHoveredCategory(category._id)}
                                            onMouseLeave={() => setHoveredCategory(null)}
                                            onClick={() => handleCategoryClick(category)}
                                        >
                                            <Card.Body className="p-1">
                                                {/* ✅ Display Image if available */}
                                                {category.imageUrl ? (
                                                    <div className="category-image-wrapper">
                                                        <img 
                                                            src={category.imageUrl} 
                                                            alt={category.name} 
                                                            className="category-image"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div 
                                                        className="category-icon mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                                                        style={{
                                                            width: '70px',
                                                            height: '70px',
                                                            background: category.color || 'var(--light-dark)',
                                                            fontSize: '30px'
                                                        }}
                                                    >
                                                        {category.icon || '🍕'}
                                                    </div>
                                                )}
                                                <h5 className="fw-bold mb-1 category-name">{category.name}</h5>
                                                {/* <small className="text-secondary category-count">{category.count || ''}</small> */}
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Col>
                            ))
                        )}
                    </Row>

                    {/* Features Row */}
                    <Row className="g-4 mt-4">
                        {features.map((feature, index) => (
                            <Col key={index} lg={3} md={6}>
                                <div className="feature-item text-center p-4 rounded-4 bg-white shadow-sm h-100">
                                    <div className="feature-icon fs-1 mb-3">{feature.icon}</div>
                                    <h5 className="fw-bold mb-2 feature-title text-secondary">{feature.title}</h5>
                                    <p className="text-secondary mb-0 small feature-desc">{feature.desc}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            <style>{`
                /* ===== FEATURES SECTION ===== */
                .features-section {
                    background: var(--light);
                    padding: 60px 0;
                }

                /* ===== SECTION HEADER ===== */
                .features-section .section-header {
                    text-align: center;
                    margin-bottom: var(--space-2xl);
                }

                .features-section .section-header .badge {
                    font-size: var(--font-sm);
                    padding: 8px 24px;
                    border-radius: var(--radius-full);
                    margin-bottom: var(--space-md);
                    display: inline-block;
                }

                .features-section .section-header h2 {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: var(--space-sm);
                }

                .features-section .section-header p {
                    color: var(--text-secondary);
                    font-size: var(--font-lg);
                    max-width: 500px;
                    margin: 0 auto;
                }

                /* ===== CATEGORY CARDS ===== */
                .category-card {
                    transition: all var(--transition-normal) !important;
                    border-radius: var(--radius-lg) !important;
                    overflow: hidden;
                    background: var(--light-card);
                    border: 2px solid transparent !important;
                }

                .category-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-lg) !important;
                }

                /* Category Image */
                .category-image-wrapper {
                    overflow: hidden;
                    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
                    height: 200px;
                    background: var(--light-dark);
                }

                .category-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform var(--transition-slow);
                }

                .category-card:hover .category-image {
                    transform: scale(1.05);
                }

                /* Category Icon */
                .category-icon {
                    transition: all var(--transition-normal);
                    margin: 20px auto 15px;
                    box-shadow: var(--shadow-sm);
                }

                .category-card:hover .category-icon {
                    transform: scale(1.1) rotate(-5deg);
                    box-shadow: var(--shadow-md);
                }

                /* Category Text */
                .category-name {
                    color: var(--text-primary);
                    margin-top: 10px;
                }

                .category-count {
                    color: var(--text-secondary);
                }

                /* ===== FEATURE ITEMS ===== */
                .feature-item {
                    background: var(--light-card);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    border-radius: var(--radius-lg);
                    transition: all var(--transition-normal);
                    padding: 24px;
                }

                .feature-item:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-md) !important;
                }

                .feature-icon {
                    color: var(--primary);
                    transition: all var(--transition-normal);
                }

                .feature-item:hover .feature-icon {
                    transform: scale(1.1);
                    color: var(--secondary);
                }

                .feature-title {
                    color: var(--text-primary);
                }

                .feature-desc {
                    color: var(--text-secondary);
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .feature-item {
                    background: var(--dark-card);
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .category-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .category-card:hover {
                    border-color: var(--secondary) !important;
                }

                [data-theme="dark"] .category-image-wrapper {
                    background: var(--dark-light);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .features-section {
                        padding: 50px 0;
                    }
                    
                    .category-image-wrapper {
                        height: 180px;
                    }
                }

                @media (max-width: 768px) {
                    .features-section {
                        padding: 40px 0;
                    }

                    .features-section .section-header h2 {
                        font-size: var(--font-2xl);
                    }

                    .category-image-wrapper {
                        height: 160px;
                    }

                    .feature-item {
                        padding: 20px;
                    }

                    .feature-item .fs-1 {
                        font-size: 2rem !important;
                    }
                }

                @media (max-width: 576px) {
                    .features-section {
                        padding: 30px 0;
                    }

                    .features-section .section-header h2 {
                        font-size: var(--font-xl);
                    }

                    .category-image-wrapper {
                        height: 140px;
                    }

                    .category-icon {
                        width: 60px !important;
                        height: 60px !important;
                        font-size: 26px !important;
                    }

                    .feature-item .fs-1 {
                        font-size: 1.8rem !important;
                    }

                    .feature-title {
                        font-size: 16px;
                    }

                    .feature-desc {
                        font-size: 13px;
                    }
                }
            `}</style>
        </>
    );
};

export default Features;