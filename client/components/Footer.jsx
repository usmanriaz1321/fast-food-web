import React from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Footer = () => {
    const handleNewsletter = (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input').value;
        if (email) {
            toast.success('📧 Thanks for subscribing to our newsletter!', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            e.target.reset();
        }
    };

    return (
        <>
            <footer className="footer-section pt-5 pb-3">
                <Container>
                    <Row className="g-4">
                        {/* Brand Column */}
                        <Col lg={4} md={6}>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="footer-brand-logo">
                                    B&D
                                </div>
                                <div>
                                    <div className="footer-brand-name">
                                        BiteDash
                                    </div>
                                    <small className="footer-brand-tagline">
                                        HARNOLI · SINCE DAY ONE
                                    </small>
                                </div>
                            </div>
                            <p className="footer-description mb-3" style={{ maxWidth: '300px' }}>
                                Fresh pizza, burgers, shawarma and family deals, cooked to order and delivered fast across Harnoli.
                            </p>
                            <div className="d-flex gap-3">
                                <a href="#" className="footer-social" aria-label="Facebook">📘</a>
                                <a href="#" className="footer-social" aria-label="Instagram">📷</a>
                                <a href="#" className="footer-social" aria-label="Twitter">🐦</a>
                                <a href="#" className="footer-social" aria-label="LinkedIn">💼</a>
                            </div>
                        </Col>

                        {/* Quick Links */}
                        <Col lg={2} md={6}>
                            <h5 className="footer-heading">Menu</h5>
                            <ul className="list-unstyled footer-links">
                                <li><Link to="/menu">Pizza</Link></li>
                                <li><Link to="/menu">Burgers</Link></li>
                                <li><Link to="/menu">Shawarma</Link></li>
                                <li><Link to="/menu">Pratha Rolls</Link></li>
                                <li><Link to="/deals">Deals</Link></li>
                            </ul>
                        </Col>

                        {/* Company */}
                        <Col lg={2} md={6}>
                            <h5 className="footer-heading">Company</h5>
                            <ul className="list-unstyled footer-links">
                                <li><Link to="/about">About Us</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                                <li><Link to="/faq">FAQ</Link></li>
                                <li><Link to="/terms">Terms</Link></li>
                                <li><Link to="/privacy">Privacy</Link></li>
                            </ul>
                        </Col>

                        {/* Contact */}
                        <Col lg={4} md={6}>
                            <h5 className="footer-heading">Stay Updated</h5>
                            <p className="footer-text mb-3">
                                Subscribe to get special offers and updates.
                            </p>
                            <Form onSubmit={handleNewsletter}>
                                <InputGroup className="footer-input-group">
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email"
                                        className="footer-input"
                                        required
                                    />
                                    <Button 
                                        className="footer-subscribe-btn"
                                        type="submit"
                                    >
                                        Subscribe
                                    </Button>
                                </InputGroup>
                            </Form>
                            <div className="mt-3">
                                <p className="footer-contact-text mb-1">
                                    📞 <strong className="footer-contact-strong">03002800707</strong>
                                </p>
                                <p className="footer-contact-text">
                                    📍 Harnoli, Tehsil Piplan, Mianwali
                                </p>
                            </div>
                        </Col>
                    </Row>

                    {/* Bottom Bar */}
                    <hr className="footer-divider" />
                    <Row className="align-items-center">
                        <Col md={6} className="text-center text-md-start">
                            <span className="footer-copyright">
                                © 2026 BiteDash, Harnoli. All rights reserved.
                            </span>
                        </Col>
                        <Col md={6} className="text-center text-md-end">
                            <span className="footer-copyright">
                                Home delivery daily · Cash on delivery available
                            </span>
                        </Col>
                    </Row>
                </Container>
            </footer>

            <style>{`
                /* ===== FOOTER SECTION ===== */
                .footer-section {
                    background: var(--dark);
                    color: var(--text-secondary);
                    padding-top: 48px;
                    padding-bottom: 16px;
                }

                /* ===== BRAND ===== */
                .footer-brand-logo {
                    background: var(--primary-gradient);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    font-size: 20px;
                    font-weight: bold;
                    transition: transform var(--transition-normal);
                    flex-shrink: 0;
                }

                .footer-brand-logo:hover {
                    transform: scale(1.05) rotate(-5deg);
                }

                .footer-brand-name {
                    font-weight: 700;
                    font-size: 20px;
                    color: var(--text-light);
                    font-family: 'Anton', sans-serif;
                    line-height: 1.2;
                }

                .footer-brand-tagline {
                    color: var(--secondary);
                    font-size: 10px;
                    letter-spacing: 2px;
                    font-weight: 600;
                }

                /* ===== DESCRIPTION ===== */
                .footer-description {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                /* ===== HEADING ===== */
                .footer-heading {
                    color: var(--text-light);
                    font-weight: 700;
                    margin-bottom: 16px;
                    font-size: var(--font-md);
                }

                /* ===== LINKS ===== */
                .footer-links li {
                    margin-bottom: 8px;
                }

                .footer-links a {
                    color: var(--text-secondary);
                    text-decoration: none;
                    transition: all var(--transition-normal);
                    font-size: var(--font-sm);
                    display: inline-block;
                    position: relative;
                }

                .footer-links a::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: -2px;
                    width: 0;
                    height: 1px;
                    background: var(--secondary);
                    transition: width var(--transition-normal);
                }

                .footer-links a:hover {
                    color: var(--secondary);
                }

                .footer-links a:hover::after {
                    width: 100%;
                }

                /* ===== SOCIAL ===== */
                .footer-social {
                    color: var(--text-secondary);
                    font-size: 20px;
                    transition: all var(--transition-normal);
                    display: inline-block;
                    text-decoration: none;
                    padding: 4px;
                }

                .footer-social:hover {
                    color: var(--secondary) !important;
                    transform: translateY(-3px) scale(1.1);
                }

                /* ===== TEXT ===== */
                .footer-text {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                /* ===== INPUT GROUP ===== */
                .footer-input-group {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all var(--transition-normal);
                }

                .footer-input-group:focus-within {
                    border-color: var(--secondary);
                    box-shadow: 0 0 0 3px rgba(244, 168, 29, 0.1);
                }

                .footer-input {
                    background: transparent !important;
                    border: none !important;
                    color: var(--text-light) !important;
                    padding: 10px 16px;
                    outline: none;
                }

                .footer-input::placeholder {
                    color: var(--text-muted);
                }

                .footer-subscribe-btn {
                    background: var(--secondary-gradient) !important;
                    border: none !important;
                    color: var(--dark) !important;
                    padding: 10px 24px;
                    font-weight: 700;
                    border-radius: 0 !important;
                    transition: all var(--transition-normal);
                    white-space: nowrap;
                }

                .footer-subscribe-btn:hover {
                    transform: scale(1.02);
                    box-shadow: var(--shadow-primary);
                }

                /* ===== CONTACT ===== */
                .footer-contact-text {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 4px;
                }

                .footer-contact-strong {
                    color: var(--text-light);
                    font-weight: 600;
                }

                /* ===== DIVIDER ===== */
                .footer-divider {
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    margin-top: 24px;
                    margin-bottom: 16px;
                }

                /* ===== COPYRIGHT ===== */
                .footer-copyright {
                    color: var(--text-secondary);
                    font-size: var(--font-xs);
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .footer-section {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .footer-input-group {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .footer-input {
                    color: var(--text-light) !important;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .footer-section {
                        padding-top: 40px;
                    }
                }

                @media (max-width: 768px) {
                    .footer-section {
                        padding-top: 32px;
                        padding-bottom: 12px;
                    }

                    .footer-heading {
                        margin-top: 8px;
                    }

                    .footer-subscribe-btn {
                        padding: 10px 16px;
                        font-size: var(--font-sm);
                    }

                    .footer-brand-logo {
                        width: 44px;
                        height: 44px;
                        font-size: 17px;
                    }

                    .footer-brand-name {
                        font-size: 18px;
                    }
                }

                @media (max-width: 576px) {
                    .footer-section {
                        padding-top: 24px;
                        padding-bottom: 8px;
                    }

                    .footer-brand-logo {
                        width: 40px;
                        height: 40px;
                        font-size: 15px;
                    }

                    .footer-brand-name {
                        font-size: 16px;
                    }

                    .footer-heading {
                        font-size: var(--font-sm);
                        margin-top: 4px;
                    }

                    .footer-links a {
                        font-size: var(--font-xs);
                    }

                    .footer-input {
                        font-size: var(--font-sm) !important;
                        padding: 8px 12px !important;
                    }

                    .footer-subscribe-btn {
                        padding: 8px 14px;
                        font-size: var(--font-xs);
                    }

                    .footer-description {
                        font-size: var(--font-xs);
                    }

                    .footer-social {
                        font-size: 17px;
                    }

                    .footer-contact-text {
                        font-size: var(--font-xs);
                    }

                    .footer-copyright {
                        font-size: 10px;
                    }

                    .footer-divider {
                        margin-top: 16px;
                        margin-bottom: 12px;
                    }
                }
            `}</style>
        </>
    );
};

export default Footer;