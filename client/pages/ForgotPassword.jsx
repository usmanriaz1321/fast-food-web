import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { authAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState('');
    const [resetToken, setResetToken] = useState('');

    const validateEmail = () => {
        if (!email.trim()) {
            setErrors({ email: 'Email is required' });
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: 'Invalid email address' });
            return false;
        }
        return true;
    };

    const validateOTP = () => {
        if (!otp || otp.length !== 6) {
            setErrors({ otp: 'Please enter a valid 6-digit OTP' });
            return false;
        }
        return true;
    };

    const validatePassword = () => {
        const newErrors = {};
        if (!newPassword) newErrors.newPassword = 'Password is required';
        else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
        if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setApiError('');
        setApiSuccess('');

        if (!validateEmail()) {
            toast.warning('⚠️ Please enter a valid email.', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authAPI.forgotPassword(email);
            if (response.data.status === 1) {
                setApiSuccess('📧 OTP sent to your email!');
                toast.success('📧 Check your email for OTP!', {
                    position: "top-right",
                    autoClose: 4000,
                    theme: "colored",
                });
                setTimeout(() => setStep(2), 1500);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send OTP';
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

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setApiError('');
        setApiSuccess('');

        if (!validateOTP()) {
            toast.warning('⚠️ Please enter a valid OTP.', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authAPI.verifyOTP(email, otp);
            if (response.data.status === 1) {
                setApiSuccess('✅ OTP verified successfully!');
                toast.success('✅ OTP verified!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
                setResetToken(response.data.data?.token || '');
                setTimeout(() => setStep(3), 1500);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
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

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setApiError('');
        setApiSuccess('');

        if (!validatePassword()) {
            toast.warning('⚠️ Please fix all errors.', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authAPI.resetPassword({
                email: email,
                newPassword: newPassword
            });

            if (response.data.status === 1) {
                setApiSuccess('✅ Password reset successfully! Redirecting to login...');
                toast.success('🎉 Password reset successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reset password';
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

    const handleResendOTP = async () => {
        setApiError('');
        setApiSuccess('');
        
        if (!email) {
            toast.warning('⚠️ Please enter your email first.', {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authAPI.resendOTP(email);
            if (response.data.status === 1) {
                setApiSuccess('📧 New OTP sent to your email!');
                toast.success('📧 New OTP sent to your email!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to resend OTP';
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

    const steps = [
        { number: 1, label: 'Email', icon: '📧' },
        { number: 2, label: 'Verify OTP', icon: '🔐' },
        { number: 3, label: 'New Password', icon: '🔑' },
    ];

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="forgot-password-section py-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={5} md={7}>
                            <Card className="forgot-card">
                                <Card.Body className="p-5">
                                    <div className="forgot-header">
                                        <div className="forgot-icon">🔑</div>
                                        <h2 className="forgot-title">Reset Password</h2>
                                        <p className="forgot-subtitle">
                                            {step === 1 && 'Enter your email to receive an OTP'}
                                            {step === 2 && 'Enter the 6-digit OTP sent to your email'}
                                            {step === 3 && 'Create your new password'}
                                        </p>
                                    </div>

                                    {apiError && (
                                        <Alert variant="danger" className="forgot-alert-error">
                                            {apiError}
                                        </Alert>
                                    )}
                                    {apiSuccess && (
                                        <Alert variant="success" className="forgot-alert-success">
                                            {apiSuccess}
                                        </Alert>
                                    )}

                                    <div className="forgot-steps">
                                        {steps.map((s) => (
                                            <div key={s.number} className="forgot-step">
                                                <div 
                                                    className={`forgot-step-circle ${step >= s.number ? 'active' : ''}`}
                                                >
                                                    {step > s.number ? '✓' : s.number}
                                                </div>
                                                <small className="forgot-step-label">{s.label}</small>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Step 1: Email */}
                                    {step === 1 && (
                                        <Form onSubmit={handleSendOTP}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="forgot-label">Email Address</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    placeholder="Enter your registered email"
                                                    value={email}
                                                    onChange={(e) => {
                                                        setEmail(e.target.value);
                                                        if (errors.email) setErrors({ ...errors, email: '' });
                                                    }}
                                                    isInvalid={!!errors.email}
                                                    disabled={isSubmitting}
                                                    className="forgot-input"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Button 
                                                type="submit" 
                                                className="forgot-submit-btn"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Sending...' : 'Send OTP →'}
                                            </Button>
                                        </Form>
                                    )}

                                    {/* Step 2: OTP Verification */}
                                    {step === 2 && (
                                        <Form onSubmit={handleVerifyOTP}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="forgot-label">Enter OTP</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter 6-digit OTP"
                                                    value={otp}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                        setOtp(value);
                                                        if (errors.otp) setErrors({ ...errors, otp: '' });
                                                    }}
                                                    isInvalid={!!errors.otp}
                                                    disabled={isSubmitting}
                                                    className="forgot-otp-input"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.otp}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Button 
                                                type="submit" 
                                                className="forgot-submit-btn"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Verifying...' : 'Verify OTP →'}
                                            </Button>

                                            <div className="forgot-resend">
                                                <Button 
                                                    variant="link" 
                                                    className="forgot-resend-btn"
                                                    onClick={handleResendOTP}
                                                    disabled={isSubmitting}
                                                >
                                                    Resend OTP
                                                </Button>
                                            </div>
                                        </Form>
                                    )}

                                    {/* Step 3: New Password */}
                                    {step === 3 && (
                                        <Form onSubmit={handleResetPassword}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="forgot-label">New Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Enter new password (min 6 chars)"
                                                    value={newPassword}
                                                    onChange={(e) => {
                                                        setNewPassword(e.target.value);
                                                        if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                                                    }}
                                                    isInvalid={!!errors.newPassword}
                                                    disabled={isSubmitting}
                                                    className="forgot-input"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.newPassword}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label className="forgot-label">Confirm Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Confirm your new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => {
                                                        setConfirmPassword(e.target.value);
                                                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                                                    }}
                                                    isInvalid={!!errors.confirmPassword}
                                                    disabled={isSubmitting}
                                                    className="forgot-input"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.confirmPassword}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Button 
                                                type="submit" 
                                                className="forgot-submit-btn"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Resetting...' : 'Reset Password →'}
                                            </Button>
                                        </Form>
                                    )}

                                    <p className="forgot-back">
                                        <Link to="/login" className="forgot-back-link">
                                            ← Back to Login
                                        </Link>
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
            <Footer />

            <style>{`
                /* ===== FORGOT PASSWORD SECTION ===== */
                .forgot-password-section {
                    background: var(--light);
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                    padding: 40px 0;
                }

                /* ===== CARD ===== */
                .forgot-card {
                    border: none !important;
                    border-radius: var(--radius-lg) !important;
                    box-shadow: var(--shadow-lg);
                    background: var(--light-card);
                    overflow: hidden;
                }

                /* ===== HEADER ===== */
                .forgot-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .forgot-icon {
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

                .forgot-card:hover .forgot-icon {
                    transform: scale(1.05) rotate(-5deg);
                    background: var(--secondary);
                }

                .forgot-title {
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }

                .forgot-subtitle {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                /* ===== ALERTS ===== */
                .forgot-alert-error {
                    border: none !important;
                    border-radius: var(--radius-sm) !important;
                    background: var(--danger-light) !important;
                    color: var(--danger) !important;
                    font-size: var(--font-sm);
                    padding: 10px 14px;
                }

                .forgot-alert-success {
                    border: none !important;
                    border-radius: var(--radius-sm) !important;
                    background: var(--success-light) !important;
                    color: var(--success) !important;
                    font-size: var(--font-sm);
                    padding: 10px 14px;
                }

                /* ===== STEPS ===== */
                .forgot-steps {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 24px;
                }

                .forgot-step {
                    text-align: center;
                    flex: 1;
                }

                .forgot-step-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 4px;
                    font-size: 16px;
                    font-weight: 700;
                    background: var(--light-dark);
                    color: var(--text-secondary);
                    transition: all var(--transition-normal);
                }

                .forgot-step-circle.active {
                    background: var(--primary);
                    color: white;
                }

                .forgot-step-label {
                    color: var(--text-secondary);
                    font-size: 10px;
                }

                /* ===== FORM ===== */
                .forgot-label {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: var(--font-sm);
                }

                .forgot-input {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    transition: all var(--transition-normal);
                }

                .forgot-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .forgot-input:disabled {
                    opacity: 0.6;
                }

                .forgot-input.is-invalid {
                    border-color: var(--danger) !important;
                }

                /* ===== OTP INPUT ===== */
                .forgot-otp-input {
                    border: 2px solid var(--light-dark) !important;
                    border-radius: var(--radius-sm) !important;
                    padding: 10px 14px !important;
                    background: var(--light-card) !important;
                    color: var(--text-primary) !important;
                    text-align: center;
                    font-size: 24px;
                    letter-spacing: 10px;
                    transition: all var(--transition-normal);
                }

                .forgot-otp-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(193, 64, 30, 0.1) !important;
                }

                .forgot-otp-input:disabled {
                    opacity: 0.6;
                }

                .forgot-otp-input.is-invalid {
                    border-color: var(--danger) !important;
                }

                /* ===== SUBMIT BUTTON ===== */
                .forgot-submit-btn {
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

                .forgot-submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-primary);
                }

                .forgot-submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== RESEND OTP ===== */
                .forgot-resend {
                    text-align: center;
                    margin-top: 12px;
                }

                .forgot-resend-btn {
                    color: var(--primary) !important;
                    text-decoration: none !important;
                    font-weight: 600;
                    padding: 0;
                    transition: all var(--transition-normal);
                }

                .forgot-resend-btn:hover:not(:disabled) {
                    color: var(--primary-dark) !important;
                    text-decoration: underline !important;
                }

                .forgot-resend-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ===== BACK LINK ===== */
                .forgot-back {
                    text-align: center;
                    margin-top: 16px;
                }

                .forgot-back-link {
                    color: var(--text-secondary) !important;
                    text-decoration: none !important;
                    font-size: var(--font-sm);
                    transition: all var(--transition-normal);
                }

                .forgot-back-link:hover {
                    color: var(--primary) !important;
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .forgot-card {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .forgot-input,
                [data-theme="dark"] .forgot-otp-input {
                    background: var(--dark-card) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: var(--text-light) !important;
                }

                [data-theme="dark"] .forgot-input:focus,
                [data-theme="dark"] .forgot-otp-input:focus {
                    border-color: var(--primary) !important;
                }

                [data-theme="dark"] .forgot-icon {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .forgot-step-circle {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .forgot-alert-error {
                    background: rgba(220, 53, 69, 0.15) !important;
                }

                [data-theme="dark"] .forgot-alert-success {
                    background: rgba(40, 167, 69, 0.15) !important;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .forgot-password-section {
                        padding: 30px 0;
                        min-height: auto;
                    }

                    .forgot-card .p-5 {
                        padding: 24px !important;
                    }

                    .forgot-title {
                        font-size: var(--font-xl);
                    }

                    .forgot-submit-btn {
                        padding: 12px;
                        font-size: var(--font-sm);
                    }

                    .forgot-steps {
                        gap: 4px;
                    }

                    .forgot-step-circle {
                        width: 32px;
                        height: 32px;
                        font-size: 13px;
                    }
                }

                @media (max-width: 576px) {
                    .forgot-password-section {
                        padding: 20px 0;
                    }

                    .forgot-card .p-5 {
                        padding: 16px !important;
                    }

                    .forgot-icon {
                        width: 56px;
                        height: 56px;
                        font-size: 26px;
                    }

                    .forgot-title {
                        font-size: var(--font-lg);
                    }

                    .forgot-input,
                    .forgot-otp-input {
                        font-size: var(--font-sm);
                        padding: 8px 12px !important;
                    }

                    .forgot-otp-input {
                        font-size: 18px;
                        letter-spacing: 6px;
                    }

                    .forgot-label {
                        font-size: var(--font-xs);
                    }

                    .forgot-step-circle {
                        width: 28px;
                        height: 28px;
                        font-size: 11px;
                    }

                    .forgot-step-label {
                        font-size: 8px;
                    }
                }
            `}</style>
        </>
    );
};

export default ForgotPassword;