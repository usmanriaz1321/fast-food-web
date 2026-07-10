import axios from 'axios';

const API_URL = 'https://fast-food-web-ruddy.vercel.app/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ========== REQUEST INTERCEPTOR ==========
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ========== RESPONSE INTERCEPTOR ==========
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // ✅ Just log the error - DON'T redirect automatically
        if (error.response?.status === 401) {
            console.log('Unauthorized request - user may need to login');
            // ❌ DO NOT redirect here - let the component handle it
        }
        return Promise.reject(error);
    }
);

// ========== AUTH SERVICES ==========
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    resendOTP: (email) => api.post('/auth/resend-otp', { email }),
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.put('/user/profile', data),
    changePassword: (data) => api.put('/user/change-password', data),
};

// ========== USER SERVICES ==========
export const userAPI = {
    getStats: () => api.get('/user/stats'),
    getOrders: () => api.get('/user/orders'),
    getCart: () => api.get('/user/cart'),
    updateProfile: (data) => api.put('/user/profile', data),
};

// ========== MENU SERVICES ==========
export const menuAPI = {
    getAll: (params) => api.get('/menu', { params }),
    getSingle: (id) => api.get(`/menu/${id}`),
    add: (data) => api.post('/menu', data),
    update: (id, data) => api.put(`/menu/${id}`, data),
    delete: (id) => api.delete(`/menu/${id}`),
    toggle: (id) => api.patch(`/menu/${id}/toggle`),
};

// ========== DEAL SERVICES ==========
export const dealAPI = {
    getAll: (params) => api.get('/deals', { params }),
    getSingle: (id) => api.get(`/deals/${id}`),
    add: (data) => api.post('/deals', data),
    update: (id, data) => api.put(`/deals/${id}`, data),
    delete: (id) => api.delete(`/deals/${id}`),
    toggle: (id) => api.patch(`/deals/${id}/toggle`),
};

// ========== CART SERVICES ==========
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart/add', data),
    update: (data) => api.put('/cart/update', data),
    remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
    clear: () => api.delete('/cart/clear'),
};

// ========== ORDER SERVICES ==========
export const orderAPI = {
    place: (data) => api.post('/orders', data),
    getAll: () => api.get('/orders'),
    getSingle: (id) => api.get(`/orders/${id}`),
};

// ========== ADMIN SERVICES ==========
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getOrders: () => api.get('/admin/orders'),
    updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
    getMenuItems: () => api.get('/admin/menu'),
    getDeals: () => api.get('/admin/deals'),
    // In api.js (add these to adminAPI)
    getFeedbacks: () => api.get('/feedback/admin'),
    approveFeedback: (id) => api.put(`/feedback/admin/${id}/approve`),
    deleteFeedback: (id) => api.delete(`/feedback/admin/${id}`),
    getUserById: (id) => api.get(`/admin/users/${id}`)
    };

// ========== UPLOAD SERVICES ==========
export const uploadAPI = {
    image: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};
// ========== FEEDBACK SERVICES ==========
export const feedbackAPI = {
    getFeedbacks: (limit = 6) => api.get(`/feedback?limit=${limit}`),
    submit: (data) => api.post('/feedback', data),
    getOrderFeedback: (orderId) => api.get(`/feedback/order/${orderId}`),
    // Admin
    getAll: () => api.get('/feedback/admin'),
    approve: (id) => api.put(`/feedback/admin/${id}/approve`),
    delete: (id) => api.delete(`/feedback/admin/${id}`),
};

// ========== CATEGORY SERVICES ==========
export const categoryAPI = {
    // ... existing

    // Categories
     getAll: () => api.get('/categories'),
    getAllCategories: () => api.get('/categories/admin'),
    addCategory: (data) => api.post('/categories', data),
    updateCategory: (id, data) => api.put(`/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}`),
    toggleCategory: (id) => api.patch(`/categories/${id}/toggle`),
};

export default api;