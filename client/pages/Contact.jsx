import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            toast.success('✅ Message sent successfully! We\'ll get back to you soon.', {
                position: "top-right",
                autoClose: 4000,
                theme: "colored",
            });
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            setIsSubmitting(false);
        }, 1500);
    };

    const contactInfo = [
        { icon: '📞', title: 'Phone', details: ['03002800707', '03140000707'] },
        { icon: '📍', title: 'Address', details: ['Harnoli', 'Tehsil Piplan, Mianwali'] },
        { icon: '⏰', title: 'Hours', details: ['Mon - Sun: 11:00 AM - 12:00 AM'] },
        { icon: '📧', title: 'Email', details: ['info@bitebash.com'] },
    ];

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="contact-section py-5">
                <Container>
                    {/* Section Header */}
                    <div className="contact-header">
                        <Badge className="contact-header-badge">📬 GET IN TOUCH</Badge>
                        <h1 className="contact-header-title">Contact Us</h1>
                        <p className="contact-header-subtitle">
                            Have a question? We'd love to hear from you. Reach out to us anytime.
                        </p>
                    </div>

                    <Row className="g-4">
                        {/* Contact Form */}
                        <Col lg={7}>
                            <Card className="contact-form-card h-100">
                                <Card.Body className="p-4">
                                    <h4 className="contact-form-title">Send Us a Message</h4>
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="contact-label">Full Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        placeholder="Enter your name"
                                                        required
                                                        disabled={isSubmitting}
                                                        className="contact-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="contact-label">Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="Enter your email"
                                                        required
                                                        disabled={isSubmitting}
                                                        className="contact-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="contact-label">Phone</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="Enter your phone number"
                                                        required
                                                        disabled={isSubmitting}
                                                        className="contact-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="contact-label">Subject</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="subject"
                                                        value={formData.subject}
                                                        onChange={handleChange}
                                                        placeholder="Order / Delivery / Feedback"
                                                        required
                                                        disabled={isSubmitting}
                                                        className="contact-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="contact-label">Message</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        name="message"
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                        placeholder="Write your message here..."
                                                        rows="4"
                                                        required
                                                        disabled={isSubmitting}
                                                        className="contact-textarea"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Button
                                                    type="submit"
                                                    className="contact-submit-btn"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Sending...' : 'Send Message →'}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Contact Info */}
                        <Col lg={5}>
                            <Card className="contact-info-card h-100">
                                <Card.Body className="p-4">
                                    <h4 className="contact-info-title">Contact Information</h4>
                                    {contactInfo.map((item, index) => (
                                        <div key={index} className="contact-info-item">
                                            <div className="contact-info-icon">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h6 className="contact-info-label">{item.title}</h6>
                                                {item.details.map((detail, i) => (
                                                    <p key={i} className="contact-info-detail">{detail}</p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Social Links */}
                                    <div className="contact-social-section">
                                        <h6 className="contact-social-title">Follow Us</h6>
                                        <div className="contact-social-links">
                                            <a 
                                                href="#" 
                                                className="contact-social-link"
                                                onClick={() => toast.info('📘 Facebook page coming soon!', { theme: "colored" })}
                                            >
                                                <div className="contact-social-icon">📘</div>
                                            </a>
                                            <a 
                                                href="#" 
                                                className="contact-social-link"
                                                onClick={() => toast.info('📷 Instagram coming soon!', { theme: "colored" })}
                                            >
                                                <div className="contact-social-icon">📷</div>
                                            </a>
                                            <a 
                                                href="#" 
                                                className="contact-social-link"
                                                onClick={() => toast.info('🐦 Twitter coming soon!', { theme: "colored" })}
                                            >
                                                <div className="contact-social-icon">🐦</div>
                                            </a>
                                            <a 
                                                href="#" 
                                                className="contact-social-link"
                                                onClick={() => toast.info('💼 LinkedIn coming soon!', { theme: "colored" })}
                                            >
                                                <div className="contact-social-icon">💼</div>
                                            </a>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Map Section */}
                    <Row className="mt-5">
                        <Col lg={12}>
                            <Card className="contact-map-card overflow-hidden">
                                <div className="contact-map-content">
                                    <span className="contact-map-icon">📍</span>
                                    <h5 className="contact-map-title">Find Us Here</h5>
                                    <p className="contact-map-text">Harnoli, Tehsil Piplan, Mianwali</p>
                                    <small className="contact-map-note">(Google Maps integration coming soon)</small>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
            <Footer />

            <style>{`
                /* ===== CONTACT SECTION ===== */
                .contact-section {
                    background: var(--light);
                    padding: 40px 0;
                }

                /* ===== HEADER ===== */
                .contact-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .contact-header-badge {
                    background: var(--primary-gradient) !important;
                    color: white !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-md);
                    margin-bottom: 12px;
                    display: inline-block;
                }

                .contact-header-title {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .contact-header-subtitle {
                    color: var(--text-secondary);
                    font-size: var(--font-lg);
                    max-width: 500px;
                    margin: 0 auto;
                }

                /* ===== FORM CARD ===== */
                .contact-form-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-card);
                    transition: all var(--transition-normal);
                }

                .contact-form-card:hover {
                    box-shadow: var(--shadow-lg);
                }

                .contact-form-title {
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: var(--text-primary);
                }

                /* ===== FORM INPUTS ===== */
                .contact-label {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: var(--font-sm);
                }

                .contact-input {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    transition: all var(--transition-normal);
                }

                .contact-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .contact-input:disabled {
                    opacity: 0.6;
                }

                .contact-textarea {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    transition: all var(--transition-normal);
                    min-height: 120px;
                    resize: vertical;
                }

                .contact-textarea:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .contact-textarea:disabled {
                    opacity: 0.6;
                }

                /* ===== SUBMIT BUTTON ===== */
                .contact-submit-btn {
                    background: var(--primary-gradient) !important;
                    border: none !important;
                    color: white !important;
                    width: 100%;
                    padding: 14px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 700;
                    font-size: var(--font-md);
                    transition: all var(--transition-normal);
                }

                .contact-submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .contact-submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== INFO CARD ===== */
                .contact-info-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    background: var(--light-dark);
                    transition: all var(--transition-normal);
                }

                .contact-info-card:hover {
                    box-shadow: var(--shadow-lg);
                }

                .contact-info-title {
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: var(--text-primary);
                }

                /* ===== INFO ITEMS ===== */
                .contact-info-item {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .contact-info-item:last-child {
                    margin-bottom: 0;
                }

                .contact-info-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--light-card);
                    font-size: 22px;
                    flex-shrink: 0;
                    transition: all var(--transition-normal);
                }

                .contact-info-item:hover .contact-info-icon {
                    background: var(--secondary);
                    transform: scale(1.05);
                }

                .contact-info-label {
                    font-weight: 700;
                    margin-bottom: 2px;
                    color: var(--text-primary);
                }

                .contact-info-detail {
                    color: var(--text-secondary);
                    margin-bottom: 0;
                    font-size: var(--font-sm);
                }

                /* ===== SOCIAL ===== */
                .contact-social-section {
                    margin-top: 20px;
                    padding-top: 16px;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                }

                .contact-social-title {
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }

                .contact-social-links {
                    display: flex;
                    gap: 12px;
                }

                .contact-social-link {
                    text-decoration: none;
                    transition: all var(--transition-normal);
                }

                .contact-social-link:hover {
                    transform: translateY(-5px);
                }

                .contact-social-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--light-card);
                    font-size: 20px;
                    transition: all var(--transition-normal);
                }

                .contact-social-link:hover .contact-social-icon {
                    box-shadow: var(--shadow-md);
                    background: var(--secondary);
                }

                /* ===== MAP CARD ===== */
                .contact-map-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-md);
                    overflow: hidden;
                }

                .contact-map-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 32px;
                    background: var(--light-dark);
                    min-height: 200px;
                    color: var(--text-primary);
                    text-align: center;
                }

                .contact-map-icon {
                    font-size: 56px;
                    margin-bottom: 8px;
                }

                .contact-map-title {
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .contact-map-text {
                    margin-bottom: 4px;
                    color: var(--text-secondary);
                }

                .contact-map-note {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .contact-form-card,
                [data-theme="dark"] .contact-info-card,
                [data-theme="dark"] .contact-map-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .contact-info-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .contact-input,
                [data-theme="dark"] .contact-textarea {
                    background: var(--dark-card) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .contact-input:focus,
                [data-theme="dark"] .contact-textarea:focus {
                    border-color: var(--primary) !important;
                }

                [data-theme="dark"] .contact-info-icon {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .contact-social-icon {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .contact-social-link:hover .contact-social-icon {
                    background: var(--secondary);
                }

                [data-theme="dark"] .contact-map-content {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .contact-social-section {
                    border-top-color: rgba(255, 255, 255, 0.05);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .contact-section {
                        padding: 30px 0;
                    }

                    .contact-header-title {
                        font-size: var(--font-2xl);
                    }

                    .contact-form-card .p-4,
                    .contact-info-card .p-4 {
                        padding: 16px !important;
                    }

                    .contact-submit-btn {
                        padding: 12px;
                        font-size: var(--font-sm);
                    }

                    .contact-social-links {
                        flex-wrap: wrap;
                    }

                    .contact-map-content {
                        padding: 24px;
                        min-height: 160px;
                    }

                    .contact-map-icon {
                        font-size: 40px;
                    }
                }

                @media (max-width: 576px) {
                    .contact-section {
                        padding: 20px 0;
                    }

                    .contact-header-title {
                        font-size: var(--font-xl);
                    }

                    .contact-header-subtitle {
                        font-size: var(--font-md);
                    }

                    .contact-input,
                    .contact-textarea {
                        font-size: var(--font-sm);
                        padding: 8px 12px !important;
                    }

                    .contact-label {
                        font-size: var(--font-xs);
                    }

                    .contact-info-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 18px;
                    }

                    .contact-info-label {
                        font-size: var(--font-sm);
                    }

                    .contact-info-detail {
                        font-size: var(--font-xs);
                    }

                    .contact-social-icon {
                        width: 38px;
                        height: 38px;
                        font-size: 17px;
                    }

                    .contact-map-content {
                        padding: 16px;
                        min-height: 140px;
                    }

                    .contact-map-icon {
                        font-size: 32px;
                    }

                    .contact-map-title {
                        font-size: var(--font-md);
                    }

                    .contact-map-text {
                        font-size: var(--font-sm);
                    }
                }
            `}</style>
        </>
    );
};

export default Contact;