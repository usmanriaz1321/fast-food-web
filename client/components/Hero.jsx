import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ Fallback images
const defaultImages = {
    pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
    shawarma: 'https://images.unsplash.com/photo-1558030006-4506843936c4?w=400&h=400&fit=crop',
    hero: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop',
    delivery: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=200&h=200&fit=crop'
};

const Hero = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleOrderNow = () => {
        if (isLoggedIn) {
            toast.success('🍕 Welcome back! Let\'s order your favorite food!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            navigate('/menu');
        } else {
            toast.info('🛒 Please login to place your order!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            setTimeout(() => navigate('/login'), 1500);
        }
    };

    const handleViewMenu = () => {
        toast.info('📋 Explore our delicious menu!', {
            position: "top-right",
            autoClose: 2000,
        });
        navigate('/menu');
    };

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section position-relative overflow-hidden">
                {/* Background Image */}
                <div className="hero-bg-image"></div>
                
                {/* Overlay */}
                <div className="hero-overlay"></div>

                {/* Background Pattern */}
                <div className="hero-pattern"></div>
                <div className="hero-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>

                <Container className="position-relative" style={{ zIndex: 2 }}>
                    <Row className="align-items-center min-vh-100 py-5">
                        <Col lg={6} className="pe-lg-5">
                            {/* Badge */}
                            <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
                                <Badge className="badge-hero-pulse px-3 py-2 rounded-pill fs-6 fw-bold">
                                    🔥 HOT & READY
                                </Badge>
                                <Badge className="badge-hero-secondary px-3 py-2 rounded-pill fs-6">
                                    ★ ORDER #001
                                </Badge>
                            </div>

                            {/* Heading */}
                            <h1 className="display-1 fw-bolder text-white mb-3 hero-title">
                                Spreading
                                <span className="text-warning d-block">friendly khushiyan.</span>
                            </h1>

                            {/* Description */}
                            <p className="lead text-white-50 mb-4 fs-5" style={{ maxWidth: '500px' }}>
                                Pizza, burgers, shawarma, and family deals — cooked fresh near Aziz Jahan Chowk 
                                and delivered straight to your door in Harnoli.
                            </p>

                            {/* Delivery Info */}
                            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                                <div className="delivery-badge delivery-success">
                                    <span className="badge-icon">🚚</span>
                                    Free Delivery
                                </div>
                                <div className="delivery-badge delivery-warning">
                                    <span className="badge-icon">⏱️</span>
                                    35-45 min
                                </div>
                                <div className="delivery-badge delivery-info">
                                    <span className="badge-icon">💳</span>
                                    Cash on Delivery
                                </div>
                            </div>

                            {/* Buttons - Using theme classes */}
                            <div className="d-flex flex-wrap gap-3">
                                <Button 
                                    className="btn-hero-primary px-5 py-3 fw-bold rounded-pill shadow-lg"
                                    onClick={handleOrderNow}
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                >
                                    Order Now → 
                                    <span className="ms-2">{isHovering ? '🍕' : '🚀'}</span>
                                </Button>
                                <Button 
                                    className="btn-hero-outline px-5 py-3 fw-bold rounded-pill"
                                    onClick={handleViewMenu}
                                >
                                    View Menu
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="d-flex flex-wrap gap-5 mt-5 pt-3 border-top border-light border-opacity-10">
                                <div className="stat-item">
                                    <h3 className="fw-bolder text-warning mb-0">10K+</h3>
                                    <small className="text-white-50">Orders Delivered</small>
                                </div>
                                <div className="stat-item">
                                    <h3 className="fw-bolder text-warning mb-0">4.9★</h3>
                                    <small className="text-white-50">Customer Rating</small>
                                </div>
                                <div className="stat-item">
                                    <h3 className="fw-bolder text-warning mb-0">99%</h3>
                                    <small className="text-white-50">On-Time Delivery</small>
                                </div>
                            </div>
                        </Col>

                        <Col lg={6} className="mt-5 mt-lg-0">
                            {/* Hero Images */}
                            <div className="hero-image-wrapper">
                                <div className="hero-image-container">
                                    {/* Main Hero Image */}
                                    <div className="hero-main-image">
                                        <img 
                                            src={defaultImages.hero} 
                                            alt="Delicious Food" 
                                            className="hero-main-img"
                                        />
                                    </div>
                                    
                                    {/* Floating Food Images */}
                                    <div className="floating-images">
                                        <div className="floating-food pizza">
                                            <img 
                                                src={defaultImages.pizza} 
                                                alt="Pizza" 
                                                className="food-img"
                                            />
                                        </div>
                                        <div className="floating-food burger">
                                            <img 
                                                src={defaultImages.burger} 
                                                alt="Burger" 
                                                className="food-img"
                                            />
                                        </div>
                                        <div className="floating-food shawarma">
                                            <img 
                                                src={defaultImages.shawarma} 
                                                alt="Shawarma" 
                                                className="food-img"
                                            />
                                        </div>
                                    </div>

                                    {/* Delivery Card */}
                                    <div className="hero-card shadow-lg">
                                        <div className="d-flex align-items-center gap-3 p-3">
                                            <div className="delivery-icon">
                                                <img 
                                                    src={defaultImages.delivery} 
                                                    alt="Delivery" 
                                                    className="delivery-img"
                                                />
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold text-dark">Free Delivery</h5>
                                                <small className="text-secondary">On orders above Rs 600</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating Badge */}
                                    <div className="rating-badge shadow">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="rating-stars">⭐</span>
                                            <div>
                                                <h6 className="mb-0 fw-bold">4.9/5</h6>
                                                <small className="text-secondary">2,847 reviews</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <style>{`
                /* ===== HERO SECTION ===== */
                .hero-section {
                    background: var(--dark);
                    min-height: 100vh;
                    position: relative;
                }

                /* ===== BACKGROUND IMAGE ===== */
                .hero-bg-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop');
                    background-size: cover;
                    background-position: center;
                    opacity: 0.15;
                    z-index: 0;
                }

                .hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(26, 18, 11, 0.95) 0%, rgba(26, 18, 11, 0.85) 100%);
                    z-index: 1;
                }

                .hero-pattern {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: radial-gradient(circle, rgba(244, 168, 29, 0.05) 1.5px, transparent 1.5px);
                    background-size: 26px 26px;
                    opacity: 0.5;
                    z-index: 1;
                }

                .hero-shapes {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                    z-index: 1;
                }

                .shape {
                    position: absolute;
                    border-radius: 50%;
                    opacity: 0.05;
                }

                .shape-1 {
                    width: 400px;
                    height: 400px;
                    background: var(--secondary);
                    top: -150px;
                    right: -150px;
                    animation: floatShape 8s ease-in-out infinite;
                }

                .shape-2 {
                    width: 250px;
                    height: 250px;
                    background: var(--primary);
                    bottom: 50px;
                    left: -80px;
                    animation: floatShape 10s ease-in-out infinite reverse;
                }

                .shape-3 {
                    width: 180px;
                    height: 180px;
                    background: var(--accent);
                    bottom: 150px;
                    right: 50px;
                    animation: floatShape 6s ease-in-out infinite;
                }

                @keyframes floatShape {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-30px) scale(1.1); }
                }

                /* ===== HERO TITLE ===== */
                .hero-title {
                    line-height: 1.1;
                    text-shadow: 0 2px 20px rgba(0,0,0,0.3);
                }

                .hero-title .text-warning {
                    color: var(--secondary) !important;
                }

                /* ===== HERO BADGES ===== */
                .badge-hero-pulse {
                    background: var(--secondary-gradient) !important;
                    color: var(--dark) !important;
                    animation: pulse 2s ease-in-out infinite;
                }

                .badge-hero-secondary {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.02); }
                }

                /* ===== DELIVERY BADGES ===== */
                .delivery-badge {
                    padding: 8px 16px;
                    border-radius: var(--radius-full);
                    font-weight: 600;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: all var(--transition-normal);
                }

                .delivery-badge:hover {
                    transform: translateY(-2px);
                }

                .delivery-success {
                    background: rgba(40, 167, 69, 0.2) !important;
                    border-color: rgba(40, 167, 69, 0.3);
                    color: var(--success) !important;
                }

                .delivery-warning {
                    background: rgba(255, 193, 7, 0.2) !important;
                    border-color: rgba(255, 193, 7, 0.3);
                    color: var(--warning) !important;
                }

                .delivery-info {
                    background: rgba(23, 162, 184, 0.2) !important;
                    border-color: rgba(23, 162, 184, 0.3);
                    color: var(--info) !important;
                }

                .badge-icon {
                    font-size: 16px;
                }

                /* ===== HERO BUTTONS ===== */
                .btn-hero-primary {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    transition: all var(--transition-normal);
                }

                .btn-hero-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary) !important;
                    background: var(--primary-dark) !important;
                }

                .btn-hero-outline {
                    background: transparent !important;
                    border: 2px solid rgba(255,255,255,0.3) !important;
                    color: #fff !important;
                    transition: all var(--transition-normal);
                }

                .btn-hero-outline:hover {
                    transform: translateY(-3px);
                    background: rgba(255,255,255,0.1) !important;
                    border-color: #fff !important;
                }

                /* ===== HERO IMAGES ===== */
                .hero-image-wrapper {
                    position: relative;
                }

                .hero-image-container {
                    position: relative;
                    min-height: 500px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .hero-main-image {
                    width: 100%;
                    max-width: 500px;
                    border-radius: var(--radius-xl);
                    overflow: hidden;
                    box-shadow: var(--shadow-xl);
                    animation: fadeInUp 1s ease-out;
                }

                .hero-main-img {
                    width: 100%;
                    height: 400px;
                    object-fit: cover;
                    transition: transform var(--transition-slow);
                }

                .hero-main-image:hover .hero-main-img {
                    transform: scale(1.03);
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* ===== FLOATING FOOD ===== */
                .floating-images {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                }

                .floating-food {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    overflow: hidden;
                    box-shadow: var(--shadow-lg);
                    border: 3px solid rgba(255,255,255,0.2);
                    animation: floatFood 6s ease-in-out infinite;
                }

                .floating-food.pizza {
                    top: 5%;
                    left: 5%;
                    animation-delay: 0s;
                    width: 90px;
                    height: 90px;
                }

                .floating-food.burger {
                    top: 15%;
                    right: 5%;
                    animation-delay: 1.5s;
                    width: 75px;
                    height: 75px;
                }

                .floating-food.shawarma {
                    bottom: 10%;
                    right: 15%;
                    animation-delay: 3s;
                    width: 85px;
                    height: 85px;
                }

                .food-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                @keyframes floatFood {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-15px) rotate(5deg); }
                    50% { transform: translateY(-25px) rotate(-5deg); }
                    75% { transform: translateY(-10px) rotate(3deg); }
                }

                /* ===== HERO CARD ===== */
                .hero-card {
                    position: absolute;
                    bottom: 0;
                    left: -20px;
                    background: rgba(255,255,255,0.95);
                    backdrop-filter: blur(10px);
                    border-radius: var(--radius-lg);
                    min-width: 200px;
                    animation: slideIn 1s ease-out 0.5s both;
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .delivery-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .delivery-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-30px) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) translateY(0);
                    }
                }

                /* ===== RATING BADGE ===== */
                .rating-badge {
                    position: absolute;
                    top: 20px;
                    right: -10px;
                    background: rgba(255,255,255,0.95);
                    backdrop-filter: blur(10px);
                    padding: 12px 18px;
                    border-radius: var(--radius-md);
                    animation: slideIn 1s ease-out 0.8s both;
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .rating-stars {
                    font-size: 24px;
                }

                /* ===== STATS ===== */
                .stat-item {
                    transition: all var(--transition-normal);
                }

                .stat-item:hover {
                    transform: translateY(-3px);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .hero-title {
                        font-size: 3.5rem;
                    }
                    
                    .hero-card {
                        position: relative;
                        left: 0;
                        margin-top: 20px;
                    }

                    .rating-badge {
                        top: auto;
                        right: 10px;
                        bottom: 120px;
                    }

                    .floating-food {
                        width: 60px;
                        height: 60px;
                    }

                    .floating-food.pizza {
                        width: 70px;
                        height: 70px;
                    }

                    .floating-food.shawarma {
                        width: 65px;
                        height: 65px;
                    }

                    .hero-main-img {
                        height: 350px;
                    }
                }

                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2.8rem;
                    }

                    .hero-main-img {
                        height: 280px;
                    }

                    .hero-image-container {
                        min-height: 400px;
                    }

                    .floating-food {
                        width: 50px;
                        height: 50px;
                    }

                    .floating-food.pizza {
                        width: 60px;
                        height: 60px;
                    }

                    .floating-food.shawarma {
                        width: 55px;
                        height: 55px;
                    }

                    .rating-badge {
                        bottom: 100px;
                        right: 5px;
                        padding: 8px 12px;
                    }

                    .rating-stars {
                        font-size: 18px;
                    }

                    .hero-card {
                        min-width: 150px;
                    }
                }

                @media (max-width: 576px) {
                    .hero-title {
                        font-size: 2rem;
                    }

                    .hero-section {
                        min-height: auto;
                    }

                    .hero-main-img {
                        height: 220px;
                    }

                    .hero-image-container {
                        min-height: 320px;
                    }

                    .floating-food {
                        width: 40px;
                        height: 40px;
                    }

                    .floating-food.pizza {
                        width: 50px;
                        height: 50px;
                    }

                    .floating-food.shawarma {
                        width: 45px;
                        height: 45px;
                    }

                    .delivery-badge {
                        font-size: 12px;
                        padding: 5px 12px;
                    }

                    .rating-badge {
                        bottom: 80px;
                        right: 0;
                        padding: 6px 10px;
                    }

                    .rating-stars {
                        font-size: 14px;
                    }

                    .hero-card {
                        min-width: 120px;
                        padding: 8px !important;
                    }

                    .hero-card h5 {
                        font-size: 14px;
                    }

                    .hero-card small {
                        font-size: 11px;
                    }

                    .delivery-icon {
                        width: 35px;
                        height: 35px;
                    }
                }
            `}</style>
        </>
    );
};

export default Hero;