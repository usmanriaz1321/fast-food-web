import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { cartAPI } from '../src/api';
import ThemeToggle from './ThemeToggle'; // ✅ ADD THIS IMPORT

const NavBar = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [cartCount, setCartCount] = useState(0);
    const [user,setUser]=useState(JSON.parse(localStorage.getItem('user')));
   
    useEffect(() => {
        if (token) {
            fetchCart();
        } else {
            setCartCount(0);
        }
    }, [token]);

    useEffect(() => {
        const handleCartUpdate = () => {
            if (token) {
                fetchCart();
            }
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        window.addEventListener('storage', (e) => {
            if (e.key === 'cartUpdated') {
                handleCartUpdate();
            }
        });

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('storage', handleCartUpdate);
        };
    }, [token]);

    const fetchCart = async () => {
        try {
            const response = await cartAPI.get();
            if (response.data.status === 1) {
                const items = response.data.data?.items || [];
                const total = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                setCartCount(total);
            }
        } catch (error) {
            console.log('Cart not available');
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                const path = window.location.pathname;
                if (path === '/dashboard' || path === '/cart' || path === '/checkout') {
                    navigate('/login');
                }
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setCartCount(0);
        navigate('/login');
    };

    return (
        <>
            {/* Top Bar */}
            <div className="top-bar py-2">
                <Container className="d-flex justify-content-between align-items-center flex-wrap">
                    <span className="top-bar-text">
                        <strong className="text-warning">Free delivery</strong> on orders above Rs 600
                    </span>
                    <span className="top-bar-text">
                        Order by phone → <strong className="text-warning">03002800707</strong> / <strong className="text-warning">03140000707</strong>
                    </span>
                </Container>
            </div>

            {/* Main Navbar */}
            <Navbar bg="white" expand="lg" className="navbar-main shadow-sm sticky-top">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
                        <div className="brand-logo">
                            B&D
                        </div>
                        <div>
                            <div className="brand-name">
                                BiteDash
                            </div>
                            <small className="brand-tagline">
                                HARNOLI · SINCE DAY ONE
                            </small>
                        </div>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="navbar-nav" />

                    <Navbar.Collapse id="navbar-nav">
                        <Nav className="ms-auto align-items-lg-center gap-lg-2">
                            <Nav.Link as={Link} to="/" className="fw-semibold position-relative nav-link-hover">
                                Home
                            </Nav.Link>
                            <Nav.Link as={Link} to="/deals" className="fw-semibold position-relative nav-link-hover">
                                Deals
                            </Nav.Link>
                            <Nav.Link as={Link} to="/menu" className="fw-semibold position-relative nav-link-hover">
                                Menu
                            </Nav.Link>
                            <Nav.Link as={Link} to="/popular" className="fw-semibold position-relative nav-link-hover">
                                Popular
                            </Nav.Link>
                            <Nav.Link as={Link} to="/track-order" className="fw-semibold position-relative nav-link-hover">
                                Track Order
                            </Nav.Link>

                            
                            {/* Cart Button */}
                            <Button className="btn-cart rounded-pill px-4 py-2 d-flex align-items-center gap-2">
                                <Nav.Link as={Link} to="/cart" className="text-white">🛒 Cart</Nav.Link>
                                {cartCount > 0 && (
                                    <Badge bg="warning" text="dark" pill className="cart-badge">
                                        {cartCount}
                                    </Badge>
                                )}
                            </Button>

                            {/* Auth Links */}
                            {token ? (
                                <>
                                    <Nav.Link as={Link} to="/dashboard" className="fw-semibold nav-link-hover">
                                        Dashboard
                                    </Nav.Link>
                                    {user?.role === 'admin' && (
                                    <Nav.Link as={Link} to="/admin-panel" className="fw-semibold nav-link-hover">
                                        Admin Panel
                                    </Nav.Link>    
                                    )}
                                    <Button className="btn-logout" size="sm" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/login" className="fw-semibold nav-link-hover">
                                        Login
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/register" className="fw-semibold nav-link-hover">
                                        Register
                                    </Nav.Link>
                                </>
                            )}
                                {/* ✅ ADD THEME TOGGLE HERE */}
                                <ThemeToggle />
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <style>{`
                /* ===== TOP BAR ===== */
                .top-bar {
                    background: var(--dark);
                    color: var(--text-light);
                    font-size: 13px;
                    border-bottom: 2px solid var(--secondary);
                }

                .top-bar-text {
                    color: var(--text-light);
                }

                .top-bar-text .text-warning {
                    color: var(--secondary) !important;
                }

                /* ===== MAIN NAVBAR ===== */
                .navbar-main {
                    background: var(--light-card) !important;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }

                /* ===== BRAND LOGO ===== */
                .brand-logo {
                    background: var(--primary-gradient);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 46px;
                    height: 46px;
                    border-radius: 50%;
                    font-size: 18px;
                    font-weight: bold;
                    transition: transform var(--transition-normal);
                }

                .brand-logo:hover {
                    transform: scale(1.05) rotate(-5deg);
                }

                .brand-name {
                    font-weight: 700;
                    font-size: 20px;
                    font-family: 'Anton', sans-serif;
                    color: var(--text-primary);
                    line-height: 1.2;
                }

                .brand-tagline {
                    color: var(--primary);
                    font-size: 10px;
                    letter-spacing: 2px;
                    font-weight: 600;
                }

                /* ===== NAV LINKS ===== */
                .nav-link-hover {
                    color: var(--text-primary) !important;
                    padding-bottom: 4px;
                    transition: color var(--transition-fast);
                }

                .nav-link-hover::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 0;
                    height: 2px;
                    background: var(--primary);
                    transition: width var(--transition-normal);
                }

                .nav-link-hover:hover::after {
                    width: 100%;
                }

                .nav-link-hover:hover {
                    color: var(--primary) !important;
                }

                /* ===== THEME TOGGLE ===== */
                .theme-toggle-btn {
                    transition: all 0.3s ease !important;
                }

                .theme-toggle-btn:hover {
                    transform: scale(1.05);
                }

                /* ===== CART BUTTON ===== */
                .btn-cart {
                    background: var(--dark) !important;
                    border: none !important;
                    transition: all var(--transition-normal);
                }

                .btn-cart:hover {
                    background: var(--primary) !important;
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-primary);
                }

                .btn-cart .text-white {
                    color: white !important;
                }

                .cart-badge {
                    background: var(--secondary) !important;
                    color: var(--dark) !important;
                    font-weight: 700;
                    animation: badgePulse 2s ease-in-out infinite;
                }

                @keyframes badgePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                /* ===== LOGOUT BUTTON ===== */
                .btn-logout {
                    background: transparent !important;
                    border: 2px solid var(--danger) !important;
                    color: var(--danger) !important;
                    padding: 6px 16px;
                    border-radius: var(--radius-full) !important;
                    font-weight: 600;
                    transition: all var(--transition-normal);
                }

                .btn-logout:hover {
                    background: var(--danger) !important;
                    color: white !important;
                    transform: translateY(-2px);
                }

                /* ===== DARK THEME OVERRIDES ===== */
                [data-theme="dark"] .navbar-main {
                    background: var(--dark-card) !important;
                    border-bottom-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .brand-name {
                    color: var(--text-light);
                }

                [data-theme="dark"] .nav-link-hover {
                    color: var(--text-secondary) !important;
                }

                [data-theme="dark"] .nav-link-hover:hover {
                    color: var(--secondary) !important;
                }

                [data-theme="dark"] .top-bar {
                    background: var(--dark-card);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .navbar-main .ms-auto {
                        gap: 8px !important;
                    }
                    
                    .nav-link-hover::after {
                        display: none;
                    }

                    .theme-toggle-btn {
                        width: 100%;
                        justify-content: center;
                        margin: 4px 0;
                    }
                }

                @media (max-width: 768px) {
                    .top-bar {
                        font-size: 11px;
                        padding: 6px 0;
                    }

                    .top-bar .d-flex {
                        flex-direction: column;
                        gap: 4px;
                        text-align: center;
                    }

                    .brand-logo {
                        width: 40px;
                        height: 40px;
                        font-size: 14px;
                    }

                    .brand-name {
                        font-size: 17px;
                    }

                    .btn-cart {
                        width: 100%;
                        justify-content: center;
                    }

                    .btn-logout {
                        width: 100%;
                        text-align: center;
                    }
                }

                @media (max-width: 576px) {
                    .brand-name {
                        font-size: 15px;
                    }

                    .brand-tagline {
                        font-size: 8px;
                        letter-spacing: 1px;
                    }

                    .brand-logo {
                        width: 36px;
                        height: 36px;
                        font-size: 12px;
                    }
                }
            `}</style>
        </>
    );
};

export default NavBar;