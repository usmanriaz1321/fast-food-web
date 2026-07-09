import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { authAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState('');

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
        if (apiError) setApiError('');
        if (apiSuccess) setApiSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.warning('⚠️ Please fix all errors before continuing.', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            return;
        }

        setIsSubmitting(true);
        setApiError('');
        setApiSuccess('');

        try {
            const { name, email, phone, password } = formData;
            const response = await authAPI.register({ name, email, phone, password });

            if (response.data.status === 1) {
                setApiSuccess('✅ Registration successful! Please login.');
                toast.success('🎉 Account created successfully!', {
                    position: "top-right",
                    autoClose: 4000,
                    theme: "colored",
                });
                
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            setApiError(message);
            toast.error(message, {
                position: "top-right",
                autoClose: 4000,
                theme: "colored",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const benefits = [
        { icon: '🚀', text: 'Fast & easy checkout' },
        { icon: '📦', text: 'Track your orders' },
        { icon: '🎁', text: 'Exclusive deals & offers' },
        { icon: '🔄', text: 'Easy reordering' },
    ];

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="register-section py-5">
                <Container>
                    <Row className="align-items-center g-5">
                        {/* Register Form */}
                        <Col lg={6}>
                            <Card className="register-card p-4">
                                <Card.Body className="p-3">
                                    <h2 className="register-title">Create Account</h2>
                                    <p className="register-subtitle">
                                        Join BiteDash and start ordering!
                                    </p>

                                    {apiError && (
                                        <Alert variant="danger" className="register-alert-error">
                                            {apiError}
                                        </Alert>
                                    )}
                                    {apiSuccess && (
                                        <Alert variant="success" className="register-alert-success">
                                            {apiSuccess}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="register-label">Full Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                placeholder="Enter your full name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                isInvalid={!!errors.name}
                                                disabled={isSubmitting}
                                                className="register-input"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.name}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="register-label">Email Address</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                isInvalid={!!errors.email}
                                                disabled={isSubmitting}
                                                className="register-input"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.email}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="register-label">Phone Number</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                placeholder="Enter your phone number"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                isInvalid={!!errors.phone}
                                                disabled={isSubmitting}
                                                className="register-input"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.phone}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="register-label">Password</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    placeholder="Create a password (min 6 chars)"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.password}
                                                    disabled={isSubmitting}
                                                    className="register-input"
                                                />
                                                <Button 
                                                    className="register-password-toggle"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    disabled={isSubmitting}
                                                >
                                                    {showPassword ? '🙈' : '👁️'}
                                                </Button>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.password}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="register-label">Confirm Password</Form.Label>
                                            <Form.Control
                                                type={showPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                placeholder="Confirm your password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                isInvalid={!!errors.confirmPassword}
                                                disabled={isSubmitting}
                                                className="register-input"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.confirmPassword}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Button 
                                            type="submit" 
                                            className="register-submit-btn mt-2"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Creating Account...' : 'Create Account →'}
                                        </Button>

                                        <p className="register-login">
                                            Already have an account? <Link to="/login" className="register-login-link">Login</Link>
                                        </p>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Benefits Section */}
                        <Col lg={6}>
                            <div className="register-benefits">
                                <h2 className="register-benefits-title">Why Join Us?</h2>
                                <p className="register-benefits-subtitle">
                                    Create an account to enjoy a faster checkout experience and exclusive benefits.
                                </p>

                                <div className="d-flex flex-column gap-3">
                                    {benefits.map((benefit, idx) => (
                                        <div 
                                            key={idx} 
                                            className="register-benefit-item"
                                        >
                                            <div className="register-benefit-icon">
                                                {benefit.icon}
                                            </div>
                                            <span className="register-benefit-text">{benefit.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="register-trust-badge">
                                    <p className="register-trust-text">
                                        🔒 Your data is safe and secure. We'll never share your information.
                                    </p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
            <Footer />

            <style>{`
                /* ===== REGISTER SECTION ===== */
                .register-section {
                    background: var(--light);
                    min-height: 80vh;
                    padding: 40px 0;
                }

                /* ===== CARD ===== */
                .register-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-lg);
                    background: var(--light-card);
                    overflow: hidden;
                    transition: all var(--transition-normal);
                }

                .register-card:hover {
                    box-shadow: var(--shadow-xl);
                }

                /* ===== TITLE ===== */
                .register-title {
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .register-subtitle {
                    color: var(--text-secondary);
                    margin-bottom: 20px;
                }

                /* ===== ALERTS ===== */
                .register-alert-error {
                    border: none !important;
                    border-radius: var(--radius-sm) !important;
                    background: var(--danger-light) !important;
                    color: var(--danger) !important;
                    font-size: var(--font-sm);
                    padding: 10px 14px;
                }

                .register-alert-success {
                    border: none !important;
                    border-radius: var(--radius-sm) !important;
                    background: var(--success-light) !important;
                    color: var(--success) !important;
                    font-size: var(--font-sm);
                    padding: 10px 14px;
                }

                /* ===== FORM ===== */
                .register-label {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: var(--font-sm);
                }

                .register-input {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    transition: all var(--transition-normal);
                }

                .register-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .register-input:disabled {
                    opacity: 0.6;
                }

                .register-input.is-invalid {
                    border-color: var(--danger) !important;
                }

                /* ===== PASSWORD TOGGLE ===== */
                .register-password-toggle {
                    background: var(--light-dark) !important;
                    border: 2px solid var(--light-dark) !important;
                    color: var(--text-primary) !important;
                    border-radius: 0 var(--radius-sm) var(--radius-sm) 0 !important;
                    transition: all var(--transition-normal);
                }

                .register-password-toggle:hover:not(:disabled) {
                    background: var(--primary) !important;
                    border-color: var(--primary) !important;
                    color: white !important;
                }

                .register-password-toggle:disabled {
                    opacity: 0.6;
                }

                /* ===== SUBMIT BUTTON ===== */
                .register-submit-btn {
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

                .register-submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .register-submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== LOGIN LINK ===== */
                .register-login {
                    text-align: center;
                    margin-top: 16px;
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .register-login-link {
                    color: var(--primary) !important;
                    font-weight: 600;
                    text-decoration: none !important;
                    transition: all var(--transition-normal);
                }

                .register-login-link:hover {
                    color: var(--primary-dark) !important;
                    text-decoration: underline !important;
                }

                /* ===== BENEFITS ===== */
                .register-benefits {
                    padding-left: 24px;
                }

                .register-benefits-title {
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }

                .register-benefits-subtitle {
                    color: var(--text-secondary);
                    margin-bottom: 20px;
                }

                .register-benefit-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--light-card);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    transition: all var(--transition-normal);
                }

                .register-benefit-item:hover {
                    transform: translateX(8px);
                    box-shadow: var(--shadow-md);
                }

                .register-benefit-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--light-dark);
                    font-size: 24px;
                    flex-shrink: 0;
                    transition: all var(--transition-normal);
                }

                .register-benefit-item:hover .register-benefit-icon {
                    background: var(--secondary);
                    transform: scale(1.05);
                }

                .register-benefit-text {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                /* ===== TRUST BADGE ===== */
                .register-trust-badge {
                    margin-top: 16px;
                    padding: 12px 16px;
                    background: var(--light-dark);
                    border-radius: var(--radius-lg);
                }

                .register-trust-text {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    margin-bottom: 0;
                    text-align: center;
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .register-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .register-input {
                    background: var(--dark-card) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .register-input:focus {
                    border-color: var(--primary) !important;
                }

                [data-theme="dark"] .register-password-toggle {
                    background: var(--dark-light) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .register-benefit-item {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .register-benefit-icon {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .register-trust-badge {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .register-alert-error {
                    background: rgba(220, 53, 69, 0.15) !important;
                }

                [data-theme="dark"] .register-alert-success {
                    background: rgba(40, 167, 69, 0.15) !important;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .register-benefits {
                        padding-left: 0;
                        margin-top: 24px;
                    }
                }

                @media (max-width: 768px) {
                    .register-section {
                        padding: 30px 0;
                    }

                    .register-card .p-4 {
                        padding: 16px !important;
                    }

                    .register-card .p-3 {
                        padding: 8px !important;
                    }

                    .register-title {
                        font-size: var(--font-xl);
                    }

                    .register-submit-btn {
                        padding: 12px;
                        font-size: var(--font-sm);
                    }

                    .register-benefit-item {
                        padding: 10px 14px;
                    }

                    .register-benefit-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                    }

                    .register-benefits-title {
                        font-size: var(--font-xl);
                    }
                }

                @media (max-width: 576px) {
                    .register-section {
                        padding: 20px 0;
                    }

                    .register-card .p-4 {
                        padding: 12px !important;
                    }

                    .register-title {
                        font-size: var(--font-lg);
                    }

                    .register-input {
                        font-size: var(--font-sm);
                        padding: 8px 12px !important;
                    }

                    .register-label {
                        font-size: var(--font-xs);
                    }

                    .register-benefit-text {
                        font-size: var(--font-sm);
                    }
                }
            `}</style>
        </>
    );
};

export default Register;