import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cta = () => {
    const navigate = useNavigate();
    const [isHovering, setIsHovering] = useState(false);
    const token = localStorage.getItem('token');

    const handleOrderNow = () => {
        if (token) {
            toast.success('🍕 Let\'s order your favorite food!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            navigate('/menu');
        } else {
            toast.info('🛒 Please login to place your order!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            setTimeout(() => navigate('/login'), 1500);
        }
    };

    const handleTrackOrder = () => {
        if (token) {
            toast.info('📦 Track your order status here!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            navigate('/track-order');
        } else {
            toast.info('🔐 Please login to track your order!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            setTimeout(() => navigate('/login'), 1500);
        }
    };

    return (
        <>
            <section className="cta-section py-5 position-relative overflow-hidden">
                {/* Background Effects */}
                <div className="cta-pattern"></div>
                <div className="cta-shapes">
                    <div className="cta-shape shape-1"></div>
                    <div className="cta-shape shape-2"></div>
                    <div className="cta-shape shape-3"></div>
                </div>

                <Container className="position-relative" style={{ zIndex: 2 }}>
                    <Row className="justify-content-center text-center">
                        <Col lg={8}>
                            {/* Badge - Using theme class */}
                            <Badge 
                                className="cta-badge px-4 py-2 rounded-pill fs-6 mb-4 fw-bold"
                            >
                                🚀 SPECIAL OFFER
                            </Badge>

                            {/* Heading */}
                            <h1 className="display-2 fw-bolder text-white mb-4 cta-title">
                                Hungry? We've Got
                                <span className="cta-highlight d-block">You Covered!</span>
                            </h1>

                            {/* Description */}
                            <p className="fs-5 cta-description mb-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                Fresh, delicious food delivered to your doorstep. 
                                Order now and get free delivery on your first order!
                            </p>

                            {/* Buttons */}
                            <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
                                <Button 
                                    className="cta-btn-primary px-5 py-3 fw-bold rounded-pill shadow-lg"
                                    onClick={handleOrderNow}
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                >
                                    Order Now {isHovering ? '🍕' : '🚀'}
                                </Button>
                                <Button 
                                    className="cta-btn-outline px-5 py-3 fw-bold rounded-pill"
                                    onClick={handleTrackOrder}
                                >
                                    Track Order
                                </Button>
                            </div>

                            {/* Trust Badges */}
                            <div className="d-flex flex-wrap justify-content-center gap-4">
                                <div className="cta-trust-item">
                                    <span className="fs-4">🛵</span>
                                    <span>Free Delivery</span>
                                </div>
                                <div className="cta-trust-item">
                                    <span className="fs-4">💳</span>
                                    <span>Cash on Delivery</span>
                                </div>
                                <div className="cta-trust-item">
                                    <span className="fs-4">⏱️</span>
                                    <span>30-45 Min</span>
                                </div>
                                <div className="cta-trust-item">
                                    <span className="fs-4">⭐</span>
                                    <span>4.9★ Rating</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <style>{`
                /* ===== CTA SECTION ===== */
                .cta-section {
                    background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%);
                    min-height: 500px;
                    display: flex;
                    align-items: center;
                    position: relative;
                }

                /* ===== PATTERN ===== */
                .cta-pattern {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1.5px, transparent 1.5px);
                    background-size: 26px 26px;
                    opacity: 0.5;
                    z-index: 1;
                }

                /* ===== SHAPES ===== */
                .cta-shapes {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                    z-index: 1;
                }

                .cta-shape {
                    position: absolute;
                    border-radius: 50%;
                    opacity: 0.08;
                }

                .cta-shape.shape-1 {
                    width: 300px;
                    height: 300px;
                    background: var(--secondary);
                    top: -100px;
                    right: -100px;
                    animation: floatShape 8s ease-in-out infinite;
                }

                .cta-shape.shape-2 {
                    width: 200px;
                    height: 200px;
                    background: var(--primary);
                    bottom: 50px;
                    left: -50px;
                    animation: floatShape 10s ease-in-out infinite reverse;
                }

                .cta-shape.shape-3 {
                    width: 150px;
                    height: 150px;
                    background: var(--accent);
                    bottom: 100px;
                    right: 50px;
                    animation: floatShape 6s ease-in-out infinite;
                }

                @keyframes floatShape {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-30px) scale(1.1); }
                }

                /* ===== BADGE ===== */
                .cta-badge {
                    background: rgba(255, 255, 255, 0.95) !important;
                    color: var(--dark) !important;
                    box-shadow: var(--shadow-md);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all var(--transition-normal);
                }

                .cta-badge:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }

                /* ===== TITLE ===== */
                .cta-title {
                    line-height: 1.1;
                    text-shadow: 0 2px 20px rgba(0,0,0,0.1);
                }

                .cta-highlight {
                    color: var(--secondary-light);
                    text-shadow: 0 2px 20px rgba(244, 168, 29, 0.3);
                }

                /* ===== DESCRIPTION ===== */
                .cta-description {
                    color: rgba(255, 255, 255, 0.8);
                }

                /* ===== PRIMARY BUTTON ===== */
                .cta-btn-primary {
                    background: var(--secondary-gradient) !important;
                    border: none !important;
                    color: var(--dark) !important;
                    transition: all var(--transition-normal);
                }

                .cta-btn-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 40px rgba(244, 168, 29, 0.4) !important;
                    background: var(--secondary-dark) !important;
                }

                /* ===== OUTLINE BUTTON ===== */
                .cta-btn-outline {
                    background: transparent !important;
                    border: 2px solid rgba(255, 255, 255, 0.3) !important;
                    color: white !important;
                    transition: all var(--transition-normal);
                }

                .cta-btn-outline:hover {
                    transform: translateY(-3px);
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: white !important;
                }

                /* ===== TRUST ITEMS ===== */
                .cta-trust-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255, 255, 255, 0.7);
                    transition: all var(--transition-normal);
                    padding: 4px 8px;
                    border-radius: var(--radius-full);
                }

                .cta-trust-item:hover {
                    color: white;
                    transform: translateY(-2px);
                    background: rgba(255, 255, 255, 0.05);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .cta-section {
                        min-height: 450px;
                        padding: 60px 0;
                    }

                    .cta-title {
                        font-size: 3rem;
                    }
                }

                @media (max-width: 768px) {
                    .cta-section {
                        min-height: 400px;
                        padding: 50px 0;
                    }

                    .cta-title {
                        font-size: 2.8rem;
                    }

                    .cta-shape.shape-1 {
                        width: 200px;
                        height: 200px;
                        top: -80px;
                        right: -80px;
                    }

                    .cta-shape.shape-2 {
                        width: 150px;
                        height: 150px;
                        bottom: 30px;
                        left: -40px;
                    }

                    .cta-shape.shape-3 {
                        width: 120px;
                        height: 120px;
                        bottom: 70px;
                        right: 30px;
                    }

                    .cta-btn-primary,
                    .cta-btn-outline {
                        padding: 12px 28px !important;
                        font-size: var(--font-md);
                    }
                }

                @media (max-width: 576px) {
                    .cta-section {
                        min-height: 350px;
                        padding: 40px 0;
                    }

                    .cta-title {
                        font-size: 2.2rem;
                    }

                    .cta-badge {
                        font-size: var(--font-sm) !important;
                        padding: 6px 16px !important;
                    }

                    .cta-description {
                        font-size: var(--font-md) !important;
                    }

                    .cta-btn-primary,
                    .cta-btn-outline {
                        padding: 10px 20px !important;
                        font-size: var(--font-sm);
                        width: 100%;
                    }

                    .cta-trust-item {
                        font-size: var(--font-sm);
                        padding: 4px 6px;
                    }

                    .cta-trust-item .fs-4 {
                        font-size: 1.2rem !important;
                    }

                    .cta-shape.shape-1 {
                        width: 150px;
                        height: 150px;
                        top: -60px;
                        right: -60px;
                    }

                    .cta-shape.shape-2 {
                        width: 100px;
                        height: 100px;
                        bottom: 20px;
                        left: -30px;
                    }

                    .cta-shape.shape-3 {
                        width: 80px;
                        height: 80px;
                        bottom: 50px;
                        right: 20px;
                    }
                }
            `}</style>
        </>
    );
};

export default Cta;