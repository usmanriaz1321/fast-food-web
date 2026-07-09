import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { authAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
        if (apiError) setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.warning('⚠️ Please fix all errors.', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            return;
        }

        setIsSubmitting(true);
        setApiError('');

        try {
            const response = await authAPI.login({
                email: formData.email,
                password: formData.password
            });

            if (response.data.status === 1) {
                const { token, user } = response.data.data;
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                toast.success('🎉 Welcome back!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });

                setTimeout(() => {
                    if (user.role === 'admin') {
                        navigate('/admin-panel');
                    } else {
                        navigate('/dashboard');
                    }
                }, 1500);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            setApiError(message);
            toast.error(message, {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="login-section py-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={5} md={7}>
                            <Card className="login-card">
                                <Card.Body className="p-5">
                                    <div className="login-header">
                                        <div className="login-icon">🔐</div>
                                        <h2 className="login-title">Welcome Back!</h2>
                                        <p className="login-subtitle">Login to continue ordering your favorites.</p>
                                    </div>

                                    {apiError && (
                                        <Alert variant="danger" className="login-alert">
                                            {apiError}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="login-label">Email Address</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                isInvalid={!!errors.email}
                                                disabled={isSubmitting}
                                                className="login-input"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.email}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="login-label">Password</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    placeholder="Enter your password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.password}
                                                    disabled={isSubmitting}
                                                    className="login-input"
                                                />
                                                <Button 
                                                    className="login-password-toggle"
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

                                        <div className="login-options">
                                            <Form.Check className="login-remember">
                                                <Form.Check.Input 
                                                    type="checkbox"
                                                    name="rememberMe"
                                                    checked={formData.rememberMe}
                                                    onChange={handleChange}
                                                />
                                                <Form.Check.Label className="login-remember-label">
                                                    Remember me
                                                </Form.Check.Label>
                                            </Form.Check>
                                            <Button 
                                                variant="link" 
                                                className="login-forgot-btn"
                                                onClick={handleForgotPassword}
                                            >
                                                Forgot Password?
                                            </Button>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="login-submit-btn"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Logging in...' : 'Login →'}
                                        </Button>

                                        <p className="login-register">
                                            Don't have an account? <Link to="/register" className="login-register-link">Register</Link>
                                        </p>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
            <Footer />

            <style>{`
                /* ===== LOGIN SECTION ===== */
                .login-section {
                    background: var(--light);
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                    padding: 40px 0;
                }

                /* ===== CARD ===== */
                .login-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-lg);
                    background: var(--light-card);
                    overflow: hidden;
                }

                /* ===== HEADER ===== */
                .login-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .login-icon {
                    width: 70px;
                    height: 70px;
                    margin: 0 auto 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: var(--light-dark);
                    font-size: 32px;
                    transition: all var(--transition-normal);
                }

                .login-card:hover .login-icon {
                    transform: scale(1.05) rotate(-5deg);
                    background: var(--secondary);
                }

                .login-title {
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .login-subtitle {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                /* ===== ALERT ===== */
                .login-alert {
                    border: none !important;
                    border-radius: var(--radius-sm) !important;
                    background: var(--danger-light) !important;
                    color: var(--danger) !important;
                    font-size: var(--font-sm);
                    padding: 10px 14px;
                }

                /* ===== FORM ===== */
                .login-label {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: var(--font-sm);
                }

                .login-input {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    transition: all var(--transition-normal);
                }

                .login-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .login-input:disabled {
                    opacity: 0.6;
                }

                .login-input.is-invalid {
                    border-color: var(--danger) !important;
                }

                /* ===== PASSWORD TOGGLE ===== */
                .login-password-toggle {
                    background: var(--light-dark) !important;
                    border: 2px solid var(--light-dark) !important;
                    color: var(--text-primary) !important;
                    border-radius: 0 var(--radius-sm) var(--radius-sm) 0 !important;
                    transition: all var(--transition-normal);
                }

                .login-password-toggle:hover:not(:disabled) {
                    background: var(--primary) !important;
                    border-color: var(--primary) !important;
                    color: white !important;
                }

                .login-password-toggle:disabled {
                    opacity: 0.6;
                }

                /* ===== OPTIONS ===== */
                .login-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .login-remember {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .login-remember .form-check-input {
                    border: 2px solid var(--text-muted);
                    border-radius: var(--radius-sm);
                    transition: all var(--transition-normal);
                }

                .login-remember .form-check-input:checked {
                    background-color: var(--primary);
                    border-color: var(--primary);
                }

                .login-remember-label {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    cursor: pointer;
                }

                .login-forgot-btn {
                    color: var(--primary) !important;
                    text-decoration: none !important;
                    font-weight: 600;
                    font-size: var(--font-sm);
                    padding: 0;
                    transition: all var(--transition-normal);
                }

                .login-forgot-btn:hover {
                    color: var(--primary-dark) !important;
                    text-decoration: underline !important;
                }

                /* ===== SUBMIT BUTTON ===== */
                .login-submit-btn {
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

                .login-submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .login-submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== REGISTER LINK ===== */
                .login-register {
                    text-align: center;
                    margin-top: 16px;
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .login-register-link {
                    color: var(--primary) !important;
                    font-weight: 600;
                    text-decoration: none !important;
                    transition: all var(--transition-normal);
                }

                .login-register-link:hover {
                    color: var(--primary-dark) !important;
                    text-decoration: underline !important;
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .login-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .login-input {
                    background: var(--dark-card) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .login-input:focus {
                    border-color: var(--primary) !important;
                }

                [data-theme="dark"] .login-password-toggle {
                    background: var(--dark-light) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .login-icon {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .login-alert {
                    background: rgba(220, 53, 69, 0.15) !important;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .login-section {
                        padding: 30px 0;
                        min-height: auto;
                    }

                    .login-card .p-5 {
                        padding: 24px !important;
                    }

                    .login-title {
                        font-size: var(--font-xl);
                    }

                    .login-options {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .login-submit-btn {
                        padding: 12px;
                        font-size: var(--font-sm);
                    }
                }

                @media (max-width: 576px) {
                    .login-section {
                        padding: 20px 0;
                    }

                    .login-card .p-5 {
                        padding: 16px !important;
                    }

                    .login-icon {
                        width: 56px;
                        height: 56px;
                        font-size: 26px;
                    }

                    .login-title {
                        font-size: var(--font-lg);
                    }

                    .login-input {
                        font-size: var(--font-sm);
                        padding: 8px 12px !important;
                    }

                    .login-label {
                        font-size: var(--font-xs);
                    }
                }
            `}</style>
        </>
    );
};

export default Login;