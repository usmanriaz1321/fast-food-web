import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Menu from '../pages/Menu';
import Dashboard from '../pages/Dashboard';
import TrackOrder from '../pages/TrackOrder';
import Register from '../pages/Register';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Cart from '../pages/Cart';
import OrderConfirmation from '../pages/OrderConfirmation';
import Checkout from '../pages/Checkout';
import Deals from '../pages/Deals';
import Popular from '../pages/Popular';
import AdminPanel from '../pages/AdminPanel';

// ========== PROTECTED ROUTE COMPONENT ==========
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
};

// ========== ADMIN ROUTE COMPONENT ==========
const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        return <Navigate to="/login" />;
    }
    if (userData.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }
    return children;
};

// ========== AUTH ROUTE COMPONENT (Redirect if already logged in) ==========
const AuthRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (token) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role === 'admin') {
            return <Navigate to="/admin-panel" />;
        }
        return <Navigate to="/dashboard" />;
    }
    return children;
};

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* ===== PUBLIC ROUTES (No login required) ===== */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/deals" element={<Deals />} />
                    <Route path="/popular" element={<Popular />} />
                    
                    {/* ===== AUTH ROUTES (Redirect if already logged in) ===== */}
                    <Route path="/register" element={
                        <AuthRoute>
                            <Register />
                        </AuthRoute>
                    } />
                    <Route path="/login" element={
                        <AuthRoute>
                            <Login />
                        </AuthRoute>
                    } />
                    <Route path="/forgot-password" element={
                        <AuthRoute>
                            <ForgotPassword />
                        </AuthRoute>
                    } />
                    
                    {/* ===== PROTECTED ROUTES (Login required) ===== */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/cart" element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    } />
                    <Route path="/order-confirmation" element={
                        <ProtectedRoute>
                            <OrderConfirmation />
                        </ProtectedRoute>
                    } />
                    <Route path="/track-order" element={
                        <ProtectedRoute>
                            <TrackOrder />
                        </ProtectedRoute>
                    } />
                    
                    {/* ===== ADMIN ROUTES (Admin only) ===== */}
                    <Route path="/admin-panel" element={
                        <AdminRoute>
                            <AdminPanel />
                        </AdminRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;