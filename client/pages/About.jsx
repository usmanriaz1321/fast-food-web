import React from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ✅ Restaurant Image URL
const restaurantImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop';

const About = () => {
    const teamMembers = [
        { name: 'Usman Riaz', role: 'Founder & CEO', icon: '👨‍💼', bio: 'Passionate about food and technology.' },
        { name: 'Ali Khan', role: 'Head Chef', icon: '👨‍🍳', bio: '15 years of culinary experience.' },
        { name: 'Fatima Noor', role: 'Operations Manager', icon: '👩‍💼', bio: 'Ensures smooth delivery operations.' },
        { name: 'Ahmad Malik', role: 'Customer Service Lead', icon: '👨‍💻', bio: 'Making customers happy every day.' },
    ];

    const stats = [
        { number: '10K+', label: 'Orders Delivered' },
        { number: '500+', label: 'Happy Customers' },
        { number: '4.9★', label: 'Average Rating' },
        { number: '99%', label: 'On-Time Delivery' },
    ];

    const handleTeamClick = (name) => {
        toast.info(`👋 Say hello to ${name}!`, {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
        });
    };

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="about-section py-5">
                <Container>
                    {/* Hero Section */}
                    <Row className="align-items-center mb-5">
                        <Col lg={6}>
                            <Badge className="about-hero-badge">ABOUT US</Badge>
                            <h1 className="about-hero-title">
                                BiteDash
                                <span className="about-hero-highlight">Harnoli's Favorite</span>
                            </h1>
                            <p className="about-hero-text">
                                BiteDash is a family-owned restaurant in Harnoli, 
                                serving delicious pizza, burgers, shawarma, and more since 2024.
                            </p>
                            <div className="about-hero-buttons">
                                <Link to="/menu">
                                    <Button className="about-hero-btn-primary">
                                        View Menu
                                    </Button>
                                </Link>
                                <Link to="/contact">
                                    <Button className="about-hero-btn-secondary">
                                        Contact Us
                                    </Button>
                                </Link>
                            </div>
                        </Col>
                        <Col lg={6} className="mt-4 mt-lg-0">
                            <div className="about-image-wrapper">
                                <img 
                                    src={restaurantImage} 
                                    alt="BiteDash Restaurant" 
                                    className="about-image"
                                />
                                <div className="about-image-overlay">
                                    <span className="about-image-icon">🍕</span>
                                    <h3 className="about-image-title">Serving Harnoli Since 2024</h3>
                                    <p className="about-image-text">Fresh food, happy customers.</p>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* Stats */}
                    <Row className="g-4 mb-5">
                        {stats.map((stat, index) => (
                            <Col key={index} lg={3} md={6}>
                                <Card className="about-stat-card h-100">
                                    <Card.Body>
                                        <h2 className="about-stat-number">{stat.number}</h2>
                                        <p className="about-stat-label">{stat.label}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Story Section */}
                    <Row className="mb-5">
                        <Col lg={6}>
                            <h2 className="about-story-title">Our Story</h2>
                            <p className="about-story-text">
                                BiteDash was born from a simple idea: to bring delicious, 
                                high-quality food to the people of Harnoli. What started as a small 
                                kitchen near Aziz Jahan Chowk has grown into a beloved local brand.
                            </p>
                            <p className="about-story-text">
                                We believe in using fresh ingredients, preparing everything with love, 
                                and delivering happiness with every order. Our menu is crafted to 
                                satisfy every craving — from pizza and burgers to shawarma and pasta.
                            </p>
                            <div className="about-story-features">
                                <div className="about-story-feature">
                                    <span className="about-story-feature-icon">✅</span>
                                    <span>100% Fresh Ingredients</span>
                                </div>
                                <div className="about-story-feature">
                                    <span className="about-story-feature-icon">✅</span>
                                    <span>Made with Love</span>
                                </div>
                                <div className="about-story-feature">
                                    <span className="about-story-feature-icon">✅</span>
                                    <span>Fast Delivery in Harnoli</span>
                                </div>
                            </div>
                        </Col>
                        <Col lg={6} className="mt-4 mt-lg-0">
                            <h2 className="about-values-title">Our Values</h2>
                            <Row className="g-3">
                                <Col sm={6}>
                                    <div className="about-value-card">
                                        <span className="about-value-icon">❤️</span>
                                        <h6 className="about-value-label">Quality</h6>
                                        <small className="about-value-text">Premium ingredients, every time.</small>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="about-value-card">
                                        <span className="about-value-icon">⚡</span>
                                        <h6 className="about-value-label">Speed</h6>
                                        <small className="about-value-text">Fast delivery, always on time.</small>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="about-value-card">
                                        <span className="about-value-icon">😊</span>
                                        <h6 className="about-value-label">Service</h6>
                                        <small className="about-value-text">Friendly, helpful, and caring.</small>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="about-value-card">
                                        <span className="about-value-icon">💰</span>
                                        <h6 className="about-value-label">Value</h6>
                                        <small className="about-value-text">Great food at great prices.</small>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {/* Team Section */}
                    <h2 className="about-team-title">Meet Our Team</h2>
                    <Row className="g-4 mb-5">
                        {teamMembers.map((member, index) => (
                            <Col key={index} lg={3} md={6}>
                                <div 
                                    className="about-team-card h-100"
                                    onClick={() => handleTeamClick(member.name)}
                                >
                                    <div className="about-team-avatar">
                                        {member.icon}
                                    </div>
                                    <h5 className="about-team-name">{member.name}</h5>
                                    <p className="about-team-role">{member.role}</p>
                                    <p className="about-team-bio">{member.bio}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
            <Footer />

            <style>{`
                /* ===== ABOUT SECTION ===== */
                .about-section {
                    background: var(--light);
                    padding: 40px 0;
                }

                /* ===== HERO ===== */
                .about-hero-badge {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-md);
                    margin-bottom: 12px;
                    display: inline-block;
                }

                .about-hero-title {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .about-hero-highlight {
                    color: var(--primary);
                    display: block;
                }

                .about-hero-text {
                    color: var(--text-secondary);
                    font-size: var(--font-lg);
                    margin-bottom: 20px;
                    max-width: 500px;
                }

                .about-hero-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .about-hero-btn-primary {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    padding: 12px 32px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .about-hero-btn-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .about-hero-btn-secondary {
                    background: transparent !important;
                    border: 2px solid var(--text-secondary) !important;
                    color: var(--text-secondary) !important;
                    padding: 12px 32px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    transition: all var(--transition-normal);
                }

                .about-hero-btn-secondary:hover {
                    background: var(--text-secondary) !important;
                    color: white !important;
                    transform: translateY(-3px);
                }

                /* ===== IMAGE ===== */
                .about-image-wrapper {
                    position: relative;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    box-shadow: var(--shadow-lg);
                }

                .about-image {
                    width: 100%;
                    height: 350px;
                    object-fit: cover;
                    transition: transform var(--transition-slow);
                }

                .about-image-wrapper:hover .about-image {
                    transform: scale(1.03);
                }

                .about-image-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 24px;
                    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
                    color: white;
                    text-align: center;
                }

                .about-image-icon {
                    font-size: 40px;
                    display: block;
                    margin-bottom: 4px;
                }

                .about-image-title {
                    font-weight: 700;
                    margin-bottom: 0;
                    color: white;
                }

                .about-image-text {
                    color: rgba(255,255,255,0.8);
                    margin-bottom: 0;
                }

                /* ===== STATS ===== */
                .about-stat-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-sm);
                    background: var(--light-card);
                    text-align: center;
                    padding: 8px;
                    transition: all var(--transition-normal);
                }

                .about-stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-md);
                }

                .about-stat-number {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    color: var(--primary);
                    margin-bottom: 4px;
                }

                .about-stat-label {
                    color: var(--text-secondary);
                    margin-bottom: 0;
                }

                /* ===== STORY ===== */
                .about-story-title {
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }

                .about-story-text {
                    color: var(--text-secondary);
                }

                .about-story-features {
                    margin-top: 16px;
                }

                .about-story-feature {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .about-story-feature-icon {
                    font-size: var(--font-xl);
                }

                /* ===== VALUES ===== */
                .about-values-title {
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }

                .about-value-card {
                    padding: 16px;
                    background: var(--light-dark);
                    border-radius: var(--radius-lg);
                    height: 100%;
                    transition: all var(--transition-normal);
                }

                .about-value-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-sm);
                    background: var(--secondary);
                }

                .about-value-icon {
                    font-size: 28px;
                    display: block;
                    margin-bottom: 8px;
                }

                .about-value-label {
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .about-value-text {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .about-value-card:hover .about-value-label {
                    color: var(--dark);
                }

                .about-value-card:hover .about-value-text {
                    color: var(--dark);
                }

                /* ===== TEAM ===== */
                .about-team-title {
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 24px;
                    color: var(--text-primary);
                }

                .about-team-card {
                    padding: 20px;
                    text-align: center;
                    border-radius: var(--radius-lg);
                    background: var(--light-card);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    transition: all var(--transition-normal);
                    cursor: pointer;
                }

                .about-team-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-lg);
                }

                .about-team-avatar {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: var(--light-dark);
                    font-size: 32px;
                    transition: all var(--transition-normal);
                }

                .about-team-card:hover .about-team-avatar {
                    background: var(--secondary);
                    transform: scale(1.05);
                }

                .about-team-name {
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .about-team-role {
                    color: var(--primary);
                    font-weight: 600;
                    font-size: var(--font-sm);
                    margin-bottom: 4px;
                }

                .about-team-bio {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 0;
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .about-stat-card,
                [data-theme="dark"] .about-team-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .about-value-card {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .about-value-card:hover {
                    background: var(--secondary);
                }

                [data-theme="dark"] .about-team-avatar {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .about-image-overlay {
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .about-image {
                        height: 280px;
                    }
                }

                @media (max-width: 768px) {
                    .about-section {
                        padding: 30px 0;
                    }

                    .about-hero-title {
                        font-size: var(--font-2xl);
                    }

                    .about-image {
                        height: 240px;
                    }

                    .about-image-wrapper {
                        margin-top: 16px;
                    }

                    .about-stat-number {
                        font-size: var(--font-2xl);
                    }

                    .about-team-card {
                        padding: 16px;
                    }

                    .about-team-avatar {
                        width: 64px;
                        height: 64px;
                        font-size: 26px;
                    }
                }

                @media (max-width: 576px) {
                    .about-section {
                        padding: 20px 0;
                    }

                    .about-hero-title {
                        font-size: var(--font-xl);
                    }

                    .about-hero-text {
                        font-size: var(--font-md);
                    }

                    .about-hero-buttons {
                        flex-direction: column;
                        width: 100%;
                    }

                    .about-hero-buttons .btn {
                        width: 100%;
                        text-align: center;
                    }

                    .about-image {
                        height: 200px;
                    }

                    .about-image-overlay {
                        padding: 16px;
                    }

                    .about-image-icon {
                        font-size: 30px;
                    }

                    .about-image-title {
                        font-size: var(--font-md);
                    }

                    .about-image-text {
                        font-size: var(--font-sm);
                    }

                    .about-stat-number {
                        font-size: var(--font-xl);
                    }

                    .about-team-card {
                        padding: 12px;
                    }

                    .about-team-avatar {
                        width: 56px;
                        height: 56px;
                        font-size: 22px;
                    }

                    .about-team-name {
                        font-size: var(--font-sm);
                    }

                    .about-team-role {
                        font-size: var(--font-xs);
                    }

                    .about-team-bio {
                        font-size: var(--font-xs);
                    }
                }
            `}</style>
        </>
    );
};

export default About;