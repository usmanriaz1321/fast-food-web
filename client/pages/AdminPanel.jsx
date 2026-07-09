import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Badge, Nav, Tab, Image, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast , ToastContainer } from 'react-toastify';
import { adminAPI, menuAPI, dealAPI, orderAPI, cartAPI, uploadAPI, categoryAPI } from '../src/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    // ========== FILTER STATES ==========
    const [search, setSearch] = useState('');        // ✅ For search input
    const [status, setStatus] = useState('All');     // ✅ For status filter
    
    const [categories, setCategories] = useState([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        icon: '🍕',
        color: '#FBE3B8',
        count: '0 items',
        imageFile: null,
        imagePreview: null
    });
    

    // ========== STATS ==========
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        totalMenuItems: 0,
        pendingOrders: 0,
        todayOrders: 0,
        totalDeals: 0,
        topSelling: 'N/A'
    });

    // ========== USERS ==========
    const [users, setUsers] = useState([]);

    // ========== MENU ITEMS ==========
    const [menuItems, setMenuItems] = useState([]);

    // ========== DEALS ==========
    const [deals, setDeals] = useState([]);

    // ========== ORDERS ==========
    const [orders, setOrders] = useState([]);


    // ========== MODALS ==========
    const [showAddItem, setShowAddItem] = useState(false);
    const [showAddDeal, setShowAddDeal] = useState(false);
    const [showEditItem, setShowEditItem] = useState(null);
    const [showEditDeal, setShowEditDeal] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(null);


   // ========== FORM STATES ==========
const [newItem, setNewItem] = useState({ 
    name: '', 
    category: '', 
    status: 'active', 
    isPopular: false,
    description: '',
    image: '🍕',
    imageFile: null,
    imagePreview: null,
    // ✅ New fields for size-specific prices
    sizes: [{ name: '', price: '' }],  // Array of size objects
    price: '',  // Single price for non-size items
    sizeOptions: []  // For size options without different prices
});

    const [newDeal, setNewDeal] = useState({ 
        name: '', 
        items: '', 
        price: '', 
        status: 'active', 
        image: '🍕',
        imageFile: null,
        imagePreview: null
    });

    const [editItem, setEditItem] = useState(null);
    const [editDeal, setEditDeal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // ========== FETCH DATA ==========
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchStats(),
                fetchUsers(),
                fetchMenuItems(),
                fetchDeals(),
                fetchOrders(),
                fetchFeedbacks() ,
                fetchCategories()
            ]);
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getStats();
            if (response.data.status === 1) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Stats Error:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            if (response.data.status === 1) {
                setUsers(response.data.data || []);
            }
        } catch (error) {
            console.error('Users Error:', error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await menuAPI.getAll();
            if (response.data.status === 1) {
                setMenuItems(response.data.data || []);
            }
        } catch (error) {
            console.error('Menu Error:', error);
        }
    };

    const fetchDeals = async () => {
        try {
            const response = await dealAPI.getAll();
            if (response.data.status === 1) {
                setDeals(response.data.data || []);
            }
        } catch (error) {
            console.error('Deals Error:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await adminAPI.getOrders();
            if (response.data.status === 1) {
                setOrders(response.data.data || []);
            }
        } catch (error) {
            console.error('Orders Error:', error);
        }
    };

    // ========== IMAGE HANDLERS ==========
    const handleImageSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'item') {
                    setNewItem({ 
                        ...newItem, 
                        imageFile: file, 
                        imagePreview: reader.result 
                    });
                } else if (type === 'deal') {
                    setNewDeal({ 
                        ...newDeal, 
                        imageFile: file, 
                        imagePreview: reader.result 
                    });
                } else if (type === 'editItem' && editItem) {
                    setEditItem({ 
                        ...editItem, 
                        imageFile: file, 
                        imagePreview: reader.result 
                    });
                } else if (type === 'editDeal' && editDeal) {
                    setEditDeal({ 
                        ...editDeal, 
                        imageFile: file, 
                        imagePreview: reader.result 
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // ========== TOGGLE POPULAR ==========
    const handleTogglePopular = async (id) => {
        try {
            const item = menuItems.find(i => i._id === id);
            if (!item) return;

            const response = await menuAPI.update(id, {
                isPopular: !item.isPopular
            });
            if (response.data.status === 1) {
                toast.success(`✅ Item ${!item.isPopular ? 'marked as popular' : 'removed from popular'}!`);
                fetchMenuItems();
                fetchStats();
            }
        } catch (error) {
            toast.error('Failed to update popular status');
        }
    };

    // ========== MENU FUNCTIONS ==========
  const handleAddItem = async () => {
    setSubmitting(true);
    try {
        let imageUrl = '';

        if (newItem.imageFile) {
            const uploadResponse = await uploadAPI.image(newItem.imageFile);
            if (uploadResponse.data.status === 1) {
                imageUrl = uploadResponse.data.data.url;
            }
        }

        // ✅ Categories that have sizes
        const hasSizes = ['Pizza', 'Pasta', 'Pratha Rolls', 'Salads', 'Burgers', 'Shawarma', 'Drinks'].includes(newItem.category);
        
        // ✅ Prepare sizes with name and price (full objects)
        let sizesData = [];
        if (hasSizes) {
            sizesData = newItem.sizes
                .filter(s => s.name && s.price)
                .map(s => ({
                    name: s.name,
                    price: parseFloat(s.price) || 0
                }));
        }
        
        // ✅ Get base price (first size price or single price)
        let itemPrice = 0;
        if (hasSizes && sizesData.length > 0) {
            itemPrice = sizesData[0].price;
        } else {
            itemPrice = parseFloat(newItem.price) || 0;
        }
        
        const itemData = {
            name: newItem.name,
            category: newItem.category,
            status: newItem.status,
            description: newItem.description,
            isPopular: newItem.isPopular || false,
            image: newItem.image || '🍕',
            imageUrl: imageUrl || '',
            sizes: sizesData, // ✅ Array of objects: [{name: "Small", price: 600}, {name: "Medium", price: 1200}]
            price: itemPrice   // ✅ Base price (first size price)
        };

        const response = await menuAPI.add(itemData);
        if (response.data.status === 1) {
            toast.success('✅ Menu item added!');
            setShowAddItem(false);
            setNewItem({ 
                name: '', 
                category: '', 
                status: 'active', 
                isPopular: false, 
                description: '',
                image: '🍕', 
                imageFile: null, 
                imagePreview: null,
                sizes: [{ name: '', price: '' }],
                price: '',
                sizeOptions: []
            });
            fetchMenuItems();
            fetchStats();
        }
    } catch (error) {
        console.error('Add Item Error:', error);
        toast.error(error.response?.data?.message || 'Failed to add item');
    } finally {
        setSubmitting(false);
    }
};
    const handleDeleteItem = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await menuAPI.delete(id);
                if (response.data.status === 1) {
                    toast.success('✅ Item deleted!');
                    fetchMenuItems();
                    fetchStats();
                }
            } catch (error) {
                toast.error('Failed to delete item');
            }
        }
    };

    const handleToggleItemStatus = async (id) => {
        try {
            const response = await menuAPI.toggle(id);
            if (response.data.status === 1) {
                toast.info(`🔄 Item status updated`);
                fetchMenuItems();
                fetchStats();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

 const handleEditItem = (item) => {
    // ✅ Check if item has sizes
    const hasSizes = item.sizes && item.sizes.length > 0;
    
    // ✅ If item has sizes, use them directly (they already have name and price)
    let sizesArray = [{ name: '', price: '' }];
    if (hasSizes && item.sizes.length > 0) {
        sizesArray = item.sizes.map(s => ({
            name: s.name || '',
            price: s.price || ''
        }));
    }
    
    setEditItem({ 
        ...item, 
        imagePreview: item.imageUrl || '',
        sizes: sizesArray,
        price: item.price || ''
    });
    setShowEditItem(true);
};

const handleUpdateItem = async () => {
    setSubmitting(true);
    try {
        let imageUrl = editItem.imageUrl || '';
        if (editItem.imageFile) {
            const uploadResponse = await uploadAPI.image(editItem.imageFile);
            if (uploadResponse.data.status === 1) {
                imageUrl = uploadResponse.data.data.url;
            }
        }

        const hasSizes = ['Pizza', 'Pasta', 'Pratha Rolls', 'Salads', 'Burgers', 'Shawarma', 'Drinks'].includes(editItem.category);
        
        // ✅ Prepare sizes with name and price (full objects)
        let sizesData = [];
        if (hasSizes && editItem.sizes) {
            sizesData = editItem.sizes
                .filter(s => s.name && s.price)
                .map(s => ({
                    name: s.name,
                    price: parseFloat(s.price) || 0
                }));
        }
        
        // ✅ Get base price
        let itemPrice = 0;
        if (hasSizes && sizesData.length > 0) {
            itemPrice = sizesData[0].price;
        } else {
            itemPrice = parseFloat(editItem.price) || 0;
        }
        
        const updateData = {
            name: editItem.name,
            category: editItem.category,
            status: editItem.status,
            description: editItem.description,
            isPopular: editItem.isPopular || false,
            image: editItem.image || '🍕',
            imageUrl: imageUrl,
            sizes: sizesData, // ✅ Array of objects with name and price
            price: itemPrice
        };

        const response = await menuAPI.update(editItem._id, updateData);
        if (response.data.status === 1) {
            toast.success('✅ Item updated!');
            setShowEditItem(false);
            setEditItem(null);
            fetchMenuItems();
            fetchStats();
        }
    } catch (error) {
        console.error('Update Item Error:', error);
        toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
        setSubmitting(false);
    }
};;
    
    // ========== DEAL FUNCTIONS ==========
    // ========== DEAL FUNCTIONS ==========
const handleAddDeal = async () => {
    setSubmitting(true);
    try {
        let imageUrl = '';

        // ✅ Upload image to Cloudinary if exists
        if (newDeal.imageFile) {
            const uploadResponse = await uploadAPI.image(newDeal.imageFile);
            
            if (uploadResponse.data.status === 1) {
                imageUrl = uploadResponse.data.data.url;  // ✅ Cloudinary URL
            }
        }

        const dealData = {
            name: newDeal.name,
            items: newDeal.items,
            price: parseFloat(newDeal.price),
            status: newDeal.status,
            image: newDeal.image,
            imageUrl: imageUrl || ''  // ✅ Cloudinary URL (not Base64)
        };

        const response = await dealAPI.add(dealData);
        if (response.data.status === 1) {
            toast.success('✅ Deal added with image!');
            setShowAddDeal(false);
            setNewDeal({ name: '', items: '', price: '', status: 'active', image: '🍕', imageFile: null, imagePreview: null });
            fetchDeals();
            fetchStats();
        }
    } catch (error) {
        console.error('Add Deal Error:', error);
        toast.error(error.response?.data?.message || 'Failed to add deal');
    } finally {
        setSubmitting(false);
    }
};
    const handleDeleteDeal = async (id) => {
        if (window.confirm('Are you sure you want to delete this deal?')) {
            try {
                const response = await dealAPI.delete(id);
                if (response.data.status === 1) {
                    toast.success('✅ Deal deleted!');
                    fetchDeals();
                    fetchStats();
                }
            } catch (error) {
                toast.error('Failed to delete deal');
            }
        }
    };

    const handleToggleDealStatus = async (id) => {
        try {
            const response = await dealAPI.toggle(id);
            if (response.data.status === 1) {
                toast.info(`🔄 Deal status updated`);
                fetchDeals();
                fetchStats();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleEditDeal = (deal) => {
        setEditDeal({ ...deal, imagePreview: deal.imageUrl || '' });
        setShowEditDeal(true);
    };

    const handleUpdateDeal = async () => {
    setSubmitting(true);
    try {
        let imageUrl = editDeal.imageUrl || '';

        // ✅ Upload new image if changed
        if (editDeal.imageFile) {
            const uploadResponse = await uploadAPI.image(editDeal.imageFile);
            
            if (uploadResponse.data.status === 1) {
                imageUrl = uploadResponse.data.data.url;
            }
        }

        const response = await dealAPI.update(editDeal._id, {
            name: editDeal.name,
            items: editDeal.items,
            price: parseFloat(editDeal.price),
            status: editDeal.status,
            image: editDeal.image,
            imageUrl: imageUrl
        });
        if (response.data.status === 1) {
            toast.success('✅ Deal updated with image!');
            setShowEditDeal(false);
            setEditDeal(null);
            fetchDeals();
            fetchStats();
        }
    } catch (error) {
        console.error('Update Deal Error:', error);
        toast.error('Failed to update deal');
    } finally {
        setSubmitting(false);
    }
};

    // ========== USER FUNCTIONS ==========
    const handleToggleUserStatus = async (id) => {
        try {
            const user = users.find(u => u._id === id);
            if (!user) return;

            const statuses = ['active', 'inactive', 'blocked'];
            const currentIdx = statuses.indexOf(user.status);
            const nextIdx = (currentIdx + 1) % statuses.length;
            
            const response = await adminAPI.updateUser(id, { status: statuses[nextIdx] });
            if (response.data.status === 1) {
                toast.info(`🔄 User status updated`);
                fetchUsers();
                fetchStats();
            }
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    // ========== ORDER FUNCTIONS ==========
    const handleUpdateOrderStatus = async (id, newStatus) => {
        try {
            const response = await adminAPI.updateOrderStatus(id, newStatus);
            if (response.data.status === 1) {
                toast.success(`✅ Order updated to ${newStatus}`);
                fetchOrders();
                fetchStats();
            }
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    // ========== HELPER ==========
    const getStatusBadge = (status) => {
        const colors = {
            'active': 'success',
            'inactive': 'secondary',
            'blocked': 'danger',
            'Pending': 'warning',
            'Preparing': 'info',
            'On Delivery': 'primary',
            'Delivered': 'success',
            'Cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    };

    // ========== FILTERED ORDERS ==========
const filteredOrders = orders.filter(order => {
    // ✅ Search filter
    const searchMatch = 
        (order._id?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (order.userId.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (order.userId.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (order.userId.phone?.toLowerCase() || '').includes(search.toLowerCase());
    
    // ✅ Status filter
    const statusMatch = status === 'All' || order.status === status;
    
    return searchMatch && statusMatch;
});

    // ========== FEEDBACKS ==========
const [feedbacks, setFeedbacks] = useState([]);
const [showFeedbackDetails, setShowFeedbackDetails] = useState(null);

// Fetch feedbacks
const fetchFeedbacks = async () => {
    try {
        const response = await adminAPI.getFeedbacks();
        if (response.data.status === 1) {
            setFeedbacks(response.data.data || []);
        }
    } catch (error) {
        console.error('Feedbacks Error:', error);
    }
};
// ========== FEEDBACK FUNCTIONS ==========
const handleApproveFeedback = async (id) => {
    try {
        const response = await adminAPI.approveFeedback(id);
        if (response.data.status === 1) {
            toast.success('✅ Feedback approved!');
            fetchFeedbacks();
        }
    } catch (error) {
        toast.error('Failed to approve feedback');
    }
};

const handleDeleteFeedback = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
        try {
            const response = await adminAPI.deleteFeedback(id);
            if (response.data.status === 1) {
                toast.success('✅ Feedback deleted!');
                fetchFeedbacks();
            }
        } catch (error) {
            toast.error('Failed to delete feedback');
        }
    }
};
// ========== FETCH USER DETAILS ==========
const fetchUserDetails = async (userId) => {
    try {
        const response = await adminAPI.getUserById(userId);
        if (response.data.status === 1) {
            setShowUserDetails(response.data.data);
        } else {
            toast.error('Failed to load user details');
        }
    } catch (error) {
        console.error('Fetch User Error:', error);
        toast.error('Failed to load user details');
    }
};
 const deleteUser=async(id)=>{
    try {
        const response = await adminAPI.deleteUser(id);
        if (response.data.status === 1) {
            toast.success('✅ User deleted!');
            fetchUsers();
            fetchStats();
        }
    } catch (error) {
        toast.error('Failed to delete user');
        }
    }

    // ========== CATEGORY IMAGE HANDLER ==========
const handleCategoryImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewCategory({ 
                ...newCategory, 
                imageFile: file, 
                imagePreview: reader.result 
            });
        };
        reader.readAsDataURL(file);
    }
};
 // Fetch Categories
    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            if (response.data.status === 1) {
                setCategories(response.data.data || []);
                console.log('Categories:', response.data.data);
            }
        } catch (error) {
            console.error('Categories Error:', error);
        }
    };
    
    // Add Category
    // ========== ADD CATEGORY ==========
const handleAddCategory = async () => {
    setSubmitting(true);
    try {
        let imageUrl = '';

        // ✅ Upload image if exists
        if (newCategory.imageFile) {
            console.log('📤 Uploading image...', newCategory.imageFile);
            const uploadResponse = await uploadAPI.image(newCategory.imageFile);
            console.log('📥 Upload response:', uploadResponse.data);
            
            if (uploadResponse.data.status === 1) {
                imageUrl = uploadResponse.data.data.url;
                console.log('✅ Image URL:', imageUrl);
            } else {
                console.log('❌ Upload failed:', uploadResponse.data.message);
            }
        }

        const categoryData = {
            name: newCategory.name,
            icon: newCategory.icon,
            color: newCategory.color,
            count: newCategory.count,
            imageUrl: imageUrl || ''
        };

        console.log('📦 Sending category data:', categoryData);

        const response = await categoryAPI.addCategory(categoryData);
        if (response.data.status === 1) {
            toast.success('✅ Category added successfully!');
            setShowAddCategory(false);
            setNewCategory({
                name: '',
                icon: '🍕',
                color: '#FBE3B8',
                count: '0 items',
                imageFile: null,
                imagePreview: null
            });
            fetchCategories();
        }
    } catch (error) {
        console.error('Add Category Error:', error);
        toast.error(error.response?.data?.message || 'Failed to add category');
    } finally {
        setSubmitting(false);
    }
};

// ========== DELETE CATEGORY ==========
const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
        try {
            const response = await categoryAPI.deleteCategory(id);
            if (response.data.status === 1) {
                toast.success('✅ Category deleted!');
                fetchCategories();
            }
        } catch (error) {
            toast.error('Failed to delete category');
        }
    }
};

// ========== TOGGLE CATEGORY STATUS ==========
const handleToggleCategoryStatus = async (id) => {
    try {
        const response = await categoryAPI.toggleCategory(id);
        if (response.data.status === 1) {
            toast.info(`🔄 Category status updated`);
            fetchCategories();
        }
    } catch (error) {
        toast.error('Failed to update category status');
    }
};

// ========== EDIT CATEGORY ==========
const [editCategory, setEditCategory] = useState(null);
const [showEditCategory, setShowEditCategory] = useState(false);

const handleEditCategory = (category) => {
    setEditCategory({
        ...category,
        imagePreview: category.imageUrl || ''
    });
    setShowEditCategory(true);
};

const handleUpdateCategory = async () => {
    setSubmitting(true);
    try {
        let imageUrl = editCategory.imageUrl || '';

        if (editCategory.imageFile) {
            const uploadResponse = await uploadAPI.image(editCategory.imageFile);
            if (uploadResponse.data.status === 1) {
                imageUrl = uploadResponse.data.data.url;
            }
        }

        const response = await categoryAPI.updateCategory(editCategory._id, {
            name: editCategory.name,
            icon: editCategory.icon,
            color: editCategory.color,
            count: editCategory.count,
            imageUrl: imageUrl
        });
        if (response.data.status === 1) {
            toast.success('✅ Category updated!');
            setShowEditCategory(false);
            setEditCategory(null);
            fetchCategories();
        }
    } catch (error) {
        toast.error('Failed to update category');
    } finally {
        setSubmitting(false);
    }
};

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <Spinner animation="border" variant="danger" style={{ width: '60px', height: '60px' }} />
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <ToastContainer />
            <Navbar />
            <section className="admin-panel">
                <Container fluid>
                    {/* Admin Header - NEW THEME */}
                    <div className="admin-header">
                        <h2 className="admin-header-title">👑 Admin Panel</h2>
                        <Badge className="admin-header-badge">Admin Access</Badge>
                    </div>

                    <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                        <Row>
                            <Col lg={2} md={3} className="mb-4">
                                {/* Sidebar Card - NEW THEME */}
                                <Card className="admin-sidebar-card">
                                    <Card.Body className="p-3">
                                        <Nav variant="pills" className="flex-column">
                                            <Nav.Item>
                                                <Nav.Link eventKey="dashboard" className="admin-nav-link">📊 Dashboard</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="orders" className="admin-nav-link">📦 Orders</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="menu" className="admin-nav-link">🍕 Menu</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="deals" className="admin-nav-link">🔥 Deals</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="users" className="admin-nav-link">👥 Users</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="feedback" className="admin-nav-link">💬 Feedback</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="categories" className="admin-nav-link">🏷️ Categories</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col lg={10} md={9}>
                                <Tab.Content>
                                    {/* ===== DASHBOARD ===== */}
                                    <Tab.Pane eventKey="dashboard">
                                        <Row className="g-3 mb-4">
                                            <Col lg={3} md={6}>
                                                <Card className="admin-stat-card h-100">
                                                    <Card.Body>
                                                        <div className="admin-stat-icon">📦</div>
                                                        <h3 className="admin-stat-number">{stats.totalOrders}</h3>
                                                        <p className="admin-stat-label">Total Orders</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col lg={3} md={6}>
                                                <Card className="admin-stat-card h-100">
                                                    <Card.Body>
                                                        <div className="admin-stat-icon">💰</div>
                                                        <h3 className="admin-stat-number">Rs. {stats.totalRevenue.toLocaleString()}</h3>
                                                        <p className="admin-stat-label">Total Revenue</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col lg={3} md={6}>
                                                <Card className="admin-stat-card h-100">
                                                    <Card.Body>
                                                        <div className="admin-stat-icon">👥</div>
                                                        <h3 className="admin-stat-number">{stats.totalUsers}</h3>
                                                        <p className="admin-stat-label">Total Users</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col lg={3} md={6}>
                                                <Card className="admin-stat-card h-100">
                                                    <Card.Body>
                                                        <div className="admin-stat-icon">⭐</div>
                                                        <h3 className="admin-stat-number">{stats.topSelling}</h3>
                                                        <p className="admin-stat-label">Top Selling</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>

                                        <Row className="g-3">
                                            <Col lg={4} md={6}>
                                                <Card className="admin-stat-card-secondary h-100">
                                                    <Card.Body>
                                                        <h6 className="admin-stat-subtitle">⏳ Pending Orders</h6>
                                                        <h2 className="admin-stat-highlight">{stats.pendingOrders}</h2>
                                                        <small className="admin-stat-small">Need attention</small>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col lg={4} md={6}>
                                                <Card className="admin-stat-card-secondary h-100">
                                                    <Card.Body>
                                                        <h6 className="admin-stat-subtitle">📅 Today's Orders</h6>
                                                        <h2 className="admin-stat-highlight">{stats.todayOrders}</h2>
                                                        <small className="admin-stat-small">Today's deliveries</small>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col lg={4} md={6}>
                                                <Card className="admin-stat-card-secondary h-100">
                                                    <Card.Body>
                                                        <h6 className="admin-stat-subtitle">🔥 Total Deals</h6>
                                                        <h2 className="admin-stat-highlight">{stats.totalDeals}</h2>
                                                        <small className="admin-stat-small">Active offers</small>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Tab.Pane>

                                    {/* ===== ORDERS ===== */}
                                    <Tab.Pane eventKey="orders">
                                        <div className="admin-toolbar">
                                            <h5 className="admin-toolbar-title">📋 All Orders</h5>
                                            <div className="admin-toolbar-controls">
                                                <Form.Select className="admin-filter-select" onChange={(e) => setStatus(e.target.value)} value={status}>
                                                    <option value='All'>All Status</option>
                                                    <option value='Pending'>Pending</option>
                                                    <option value='Preparing'>Preparing</option>
                                                    <option value='On Delivery'>On Delivery</option>
                                                    <option value='Delivered'>Delivered</option>
                                                    <option value='Cancelled'>Cancelled</option>
                                                </Form.Select>
                                                <Form.Control type="text" placeholder="Search order..." className="admin-search-input" onChange={(e) => setSearch(e.target.value)} value={search} />
                                            </div>
                                        </div>

                                        <div className="admin-table-wrapper">
                                            <Table striped hover className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>Order ID</th>
                                                        <th>Customer</th>
                                                        <th>Items</th>
                                                        <th>Total</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredOrders.map((order) => (
                                                        <tr key={order._id}>
                                                            <td className="fw-bold">{order._id}</td>
                                                            <td>{order.userId.name}</td>
                                                            <td>{order.items.length}</td>
                                                            <td>Rs. {order.total.toLocaleString()}</td>
                                                            <td>
                                                                <Badge className={`admin-status-${order.status?.toLowerCase() || 'pending'}`}>
                                                                    {order.status}
                                                                </Badge>
                                                            </td>
                                                            <td>{new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                            <td>
                                                                <div className="d-flex gap-1">
                                                                    <Button className="admin-action-btn admin-action-view" size="sm" onClick={() => setShowOrderDetails(order)}>📋</Button>
                                                                    <Form.Select size="sm" className="admin-status-select" value={order.status} onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)} disabled={order.status=='CancelledByUser'}>
                                                                        <option value="Pending">Pending</option>
                                                                        <option value="Preparing">Preparing</option>
                                                                        <option value="On Delivery">On Delivery</option>
                                                                        <option value="Delivered">Delivered</option>
                                                                        <option value="Cancelled">Cancelled</option>
                                                                    </Form.Select>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Tab.Pane>

                                    {/* ===== MENU ===== */}
                                    <Tab.Pane eventKey="menu">
                                        <div className="admin-toolbar">
                                            <h5 className="admin-toolbar-title">🍕 Menu Items</h5>
                                            <Button className="admin-add-btn" onClick={() => setShowAddItem(true)}>+ Add Item</Button>
                                        </div>

                                        <div className="admin-table-wrapper">
                                            <Table striped hover className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Name</th>
                                                        <th>Category</th>
                                                        <th>Sizes & Prices</th>
                                                        <th>Status</th>
                                                        <th>Popular</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {menuItems.map((item) => {
                                                        const hasSizes = item.sizes && item.sizes.length > 0;
                                                        return (
                                                            <tr key={item._id}>
                                                                <td>
                                                                    {item.imageUrl ? (
                                                                        <img src={item.imageUrl} alt={item.name} className="admin-thumbnail" />
                                                                    ) : (
                                                                        <span className="admin-thumbnail-emoji">{item.image || '🍕'}</span>
                                                                    )}
                                                                </td>
                                                                <td className="fw-semibold">{item.name}</td>
                                                                <td>{item.category}</td>
                                                                <td>
                                                                    {hasSizes ? (
                                                                        <div>
                                                                            {item.sizes.map((size, idx) => (
                                                                                <Badge key={idx} className="admin-size-badge">{size.name}: Rs. {size.price}</Badge>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <Badge className="admin-price-badge">Rs. {item.price}</Badge>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <Badge className={item.status === 'active' ? 'admin-status-active' : 'admin-status-inactive'}>
                                                                        {item.status}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Badge className={item.isPopular ? 'admin-popular-active' : 'admin-popular-inactive'} style={{ cursor: 'pointer' }} onClick={() => handleTogglePopular(item._id)}>
                                                                        {item.isPopular ? '⭐ Popular' : '⬜ Not Popular'}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Button className="admin-action-btn admin-action-edit" size="sm" onClick={() => handleEditItem(item)}>✏️</Button>
                                                                    <Button className="admin-action-btn admin-action-delete" size="sm" onClick={() => handleDeleteItem(item._id)}>🗑️</Button>
                                                                    <Button className="admin-action-btn admin-action-toggle" size="sm" onClick={() => handleToggleItemStatus(item._id)}>
                                                                        {item.status === 'active' ? '🔒' : '🔓'}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Tab.Pane>

                                    {/* ===== DEALS ===== */}
                                    <Tab.Pane eventKey="deals">
                                        <div className="admin-toolbar">
                                            <h5 className="admin-toolbar-title">🔥 Deals</h5>
                                            <Button className="admin-add-btn" onClick={() => setShowAddDeal(true)}>+ Add Deal</Button>
                                        </div>

                                        <div className="admin-table-wrapper">
                                            <Table striped hover className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Name</th>
                                                        <th>Items</th>
                                                        <th>Price</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {deals.map((deal) => (
                                                        <tr key={deal._id}>
                                                            <td>
                                                                {deal.imageUrl ? (
                                                                    <img src={deal.imageUrl} alt={deal.name} className="admin-thumbnail" />
                                                                ) : (
                                                                    <span className="admin-thumbnail-emoji">{deal.image}</span>
                                                                )}
                                                            </td>
                                                            <td className="fw-semibold">{deal.name}</td>
                                                            <td>{deal.items}</td>
                                                            <td>Rs. {deal.price}</td>
                                                            <td>
                                                                <Badge className={deal.status === 'active' ? 'admin-status-active' : 'admin-status-inactive'}>
                                                                    {deal.status}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Button className="admin-action-btn admin-action-edit" size="sm" onClick={() => handleEditDeal(deal)}>✏️</Button>
                                                                <Button className="admin-action-btn admin-action-delete" size="sm" onClick={() => handleDeleteDeal(deal._id)}>🗑️</Button>
                                                                <Button className="admin-action-btn admin-action-toggle" size="sm" onClick={() => handleToggleDealStatus(deal._id)}>
                                                                    {deal.status === 'active' ? '🔒' : '🔓'}
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Tab.Pane>

                                    {/* ===== USERS ===== */}
                                    <Tab.Pane eventKey="users">
                                        <h5 className="admin-toolbar-title">👥 All Users</h5>

                                        <div className="admin-table-wrapper">
                                            <Table striped hover className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Phone</th>
                                                        <th>Joined</th>
                                                        <th>Status</th>
                                                        <th>Role</th>
                                                        <th className="text-center" style={{ minWidth: '120px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map((user) => (
                                                        <tr key={user._id}>
                                                            <td>{user._id}</td>
                                                            <td className="fw-semibold">{user.name}</td>
                                                            <td>{user.email}</td>
                                                            <td>{user.phone}</td>
                                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                            <td>
                                                                <Badge className={`admin-status-${user.status?.toLowerCase() || 'active'}`}>
                                                                    {user.status}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Badge className={user.role === 'admin' ? 'admin-role-admin' : 'admin-role-user'}>
                                                                    {user.role}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-1 flex-nowrap">
                                                                    <Button className="admin-action-btn admin-action-view" size="sm" onClick={() => fetchUserDetails(user._id)} title="View Details">👁️</Button>
                                                                    <Button className="admin-action-btn admin-action-toggle" size="sm" onClick={() => handleToggleUserStatus(user._id)} title="Toggle Status">🔄</Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Tab.Pane>

                                    {/* ===== FEEDBACK ===== */}
                                    <Tab.Pane eventKey="feedback">
                                        <div className="admin-toolbar">
                                            <h5 className="admin-toolbar-title">💬 Customer Feedback</h5>
                                            <Badge className="admin-pending-badge">{feedbacks.filter(f => f.status === 'pending').length} Pending</Badge>
                                        </div>

                                        <div className="admin-table-wrapper">
                                            <Table striped hover className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>User</th>
                                                        <th>Rating</th>
                                                        <th>Review</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {feedbacks.length === 0 ? (
                                                        <tr><td colSpan="6" className="text-center py-4 text-secondary">No feedbacks yet.</td></tr>
                                                    ) : (
                                                        feedbacks.map((feedback) => (
                                                            <tr key={feedback._id}>
                                                                <td>
                                                                    <div className="fw-semibold">{feedback.name}</div>
                                                                    <small className="text-secondary">{feedback.email}</small>
                                                                </td>
                                                                <td>{'⭐'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}</td>
                                                                <td>{feedback.review?.length > 50 ? feedback.review.slice(0, 50) + '...' : feedback.review}</td>
                                                                <td>
                                                                    <Badge className={`admin-status-${feedback.status?.toLowerCase() || 'pending'}`}>
                                                                        {feedback.status || 'pending'}
                                                                    </Badge>
                                                                </td>
                                                                <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                                                                <td>
                                                                    <div className="d-flex gap-1 flex-wrap">
                                                                        <Button className="admin-action-btn admin-action-view" size="sm" onClick={() => setShowFeedbackDetails(feedback)}>👁️</Button>
                                                                        {feedback.status !== 'approved' && (
                                                                            <Button className="admin-action-btn admin-action-approve" size="sm" onClick={() => handleApproveFeedback(feedback._id)}>✅</Button>
                                                                        )}
                                                                        <Button className="admin-action-btn admin-action-delete" size="sm" onClick={() => handleDeleteFeedback(feedback._id)}>🗑️</Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Tab.Pane>

                                    {/* ===== CATEGORIES ===== */}
                                    <Tab.Pane eventKey="categories">
                                        <div className="admin-toolbar">
                                            <h5 className="admin-toolbar-title">🏷️ Categories</h5>
                                            <Button className="admin-add-btn" onClick={() => setShowAddCategory(true)}>+ Add Category</Button>
                                        </div>

                                        <div className="admin-table-wrapper">
                                            <Table striped hover className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Name</th>
                                                        <th>Icon</th>
                                                        <th>Count</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categories.map((category) => (
                                                        <tr key={category._id}>
                                                            <td>
                                                                {category.imageUrl ? (
                                                                    <img src={category.imageUrl} alt={category.name} className="admin-thumbnail" />
                                                                ) : (
                                                                    <span className="admin-thumbnail-emoji">{category.icon || '🍕'}</span>
                                                                )}
                                                            </td>
                                                            <td className="fw-semibold">{category.name}</td>
                                                            <td style={{ fontSize: '24px' }}>{category.icon}</td>
                                                            <td>{category.count}</td>
                                                            <td>
                                                                <Badge className={category.status === 'active' ? 'admin-status-active' : 'admin-status-inactive'}>
                                                                    {category.status}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex gap-1">
                                                                    <Button className="admin-action-btn admin-action-edit" size="sm" onClick={() => handleEditCategory(category)}>✏️</Button>
                                                                    <Button className="admin-action-btn admin-action-delete" size="sm" onClick={() => handleDeleteCategory(category._id)}>🗑️</Button>
                                                                    <Button className="admin-action-btn admin-action-toggle" size="sm" onClick={() => handleToggleCategoryStatus(category._id)}>
                                                                        {category.status === 'active' ? '🔒' : '🔓'}
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </Container>
            </section>
            
            

           {/* ===== ADD ITEM MODAL - NEW THEME ===== */}
            <Modal show={showAddItem} onHide={() => setShowAddItem(false)} size="lg" className="admin-modal">
                <Modal.Header closeButton>
                    <Modal.Title>➕ Add Menu Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Item Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter item name"
                                        className="admin-modal-input"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Category</Form.Label>
                                    <Form.Select
                                        className="admin-modal-select"
                                        value={newItem.category}
                                        onChange={(e) => {
                                            const category = e.target.value;
                                            const hasSizes = ['Pizza', 'Pasta', 'Pratha Rolls', 'Salads', 'Burgers', 'Shawarma', 'Drinks'].includes(category);
                                            setNewItem({ 
                                                ...newItem, 
                                                category: category,
                                                sizes: hasSizes ? [{ name: '', price: '' }] : [],
                                                price: hasSizes ? '' : newItem.price
                                            });
                                        }}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Pizza">Pizza</option>
                                        <option value="Burgers">Burgers</option>
                                        <option value="Shawarma">Shawarma</option>
                                        <option value="Pasta">Pasta</option>
                                        <option value="Pratha Rolls">Pratha Rolls</option>
                                        <option value="Sandwiches">Sandwiches</option>
                                        <option value="Sides">Sides</option>
                                        <option value="Salads">Salads</option>
                                        <option value="Drinks">Drinks</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                                    
                            {/* ✅ Size-Specific Price Section */}
                            {['Pizza', 'Pasta', 'Pratha Rolls', 'Salads', 'Burgers', 'Shawarma', 'Drinks'].includes(newItem.category) ? (
                                <Col md={12}>
                                    <Form.Label className="admin-modal-label fw-bold">Sizes & Prices</Form.Label>
                                    {newItem.sizes.map((size, index) => (
                                        <Row key={index} className="g-2 mb-2">
                                            <Col md={6}>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Size name (e.g., Small)"
                                                    className="admin-modal-input"
                                                    value={size.name}
                                                    onChange={(e) => {
                                                        const updatedSizes = [...newItem.sizes];
                                                        updatedSizes[index].name = e.target.value;
                                                        setNewItem({ ...newItem, sizes: updatedSizes });
                                                    }}
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Price"
                                                    className="admin-modal-input"
                                                    value={size.price}
                                                    onChange={(e) => {
                                                        const updatedSizes = [...newItem.sizes];
                                                        updatedSizes[index].price = e.target.value;
                                                        setNewItem({ ...newItem, sizes: updatedSizes });
                                                    }}
                                                />
                                            </Col>
                                            <Col md={2}>
                                                <Button
                                                    className="admin-modal-remove-btn"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updatedSizes = newItem.sizes.filter((_, i) => i !== index);
                                                        setNewItem({ ...newItem, sizes: updatedSizes });
                                                    }}
                                                    disabled={newItem.sizes.length <= 1}
                                                >
                                                    ✕
                                                </Button>
                                            </Col>
                                        </Row>
                                    ))}
                                    <Button
                                        className="admin-modal-add-size-btn"
                                        size="sm"
                                        onClick={() => {
                                            setNewItem({ 
                                                ...newItem, 
                                                sizes: [...newItem.sizes, { name: '', price: '' }] 
                                            });
                                        }}
                                    >
                                        + Add Size
                                    </Button>
                                </Col>
                            ) : (
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Price</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter price"
                                            className="admin-modal-input"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                            )}

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Status</Form.Label>
                                    <Form.Select
                                        className="admin-modal-select"
                                        value={newItem.status}
                                        onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        className="admin-modal-textarea"
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="d-flex align-items-center">
                                    <Form.Check
                                        type="switch"
                                        label="Mark as Popular"
                                        className="admin-modal-switch"
                                        checked={newItem.isPopular}
                                        onChange={(e) => setNewItem({ ...newItem, isPopular: e.target.checked })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Item Image</Form.Label>
                                    <div className="admin-modal-upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageSelect(e, 'item')}
                                            style={{ display: 'none' }}
                                            id="item-image-upload"
                                        />
                                        <label htmlFor="item-image-upload" className="admin-modal-upload-btn">
                                            📁 Choose Image
                                        </label>
                                        {newItem.imagePreview && (
                                            <div className="mt-2">
                                                <img 
                                                    src={newItem.imagePreview} 
                                                    alt="Preview" 
                                                    className="admin-modal-preview"
                                                />
                                            </div>
                                        )}
                                        {!newItem.imagePreview && (
                                            <p className="admin-modal-upload-text">No image selected. Emoji will be used as fallback.</p>
                                        )}
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="admin-modal-cancel" onClick={() => setShowAddItem(false)}>Cancel</Button>
                    <Button className="admin-modal-submit" onClick={handleAddItem}>Add Item</Button>
                </Modal.Footer>
            </Modal>

            {/* ===== ADD DEAL MODAL - NEW THEME ===== */}
            <Modal show={showAddDeal} onHide={() => setShowAddDeal(false)} size="lg" className="admin-modal">
                <Modal.Header closeButton>
                    <Modal.Title>➕ Add Deal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Deal Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter deal name"
                                        className="admin-modal-input"
                                        value={newDeal.name}
                                        onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter price"
                                        className="admin-modal-input"
                                        value={newDeal.price}
                                        onChange={(e) => setNewDeal({ ...newDeal, price: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Items Included</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows="2"
                                        placeholder="List items included in deal"
                                        className="admin-modal-textarea"
                                        value={newDeal.items}
                                        onChange={(e) => setNewDeal({ ...newDeal, items: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Status</Form.Label>
                                    <Form.Select
                                        className="admin-modal-select"
                                        value={newDeal.status}
                                        onChange={(e) => setNewDeal({ ...newDeal, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Deal Image</Form.Label>
                                    <div className="admin-modal-upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageSelect(e, 'deal')}
                                            style={{ display: 'none' }}
                                            id="deal-image-upload"
                                        />
                                        <label htmlFor="deal-image-upload" className="admin-modal-upload-btn">
                                            📁 Choose Image
                                        </label>
                                        {newDeal.imagePreview && (
                                            <div className="mt-2">
                                                <img 
                                                    src={newDeal.imagePreview} 
                                                    alt="Preview" 
                                                    className="admin-modal-preview"
                                                />
                                            </div>
                                        )}
                                        {!newDeal.imagePreview && (
                                            <p className="admin-modal-upload-text">No image selected. Emoji will be used as fallback.</p>
                                        )}
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="admin-modal-cancel" onClick={() => setShowAddDeal(false)}>Cancel</Button>
                    <Button className="admin-modal-submit" onClick={handleAddDeal}>Add Deal</Button>
                </Modal.Footer>
            </Modal>

            {/* ===== EDIT ITEM MODAL - NEW THEME ===== */}
            <Modal show={!!showEditItem} onHide={() => setShowEditItem(false)} size="lg" className="admin-modal">
                <Modal.Header closeButton>
                    <Modal.Title>✏️ Edit Menu Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editItem && (
                        <Form>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Item Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="admin-modal-input"
                                            value={editItem.name}
                                            onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Category</Form.Label>
                                        <Form.Select
                                            className="admin-modal-select"
                                            value={editItem.category}
                                            onChange={(e) => {
                                                const category = e.target.value;
                                                const hasSizes = ['Pizza', 'Pasta', 'Pratha Rolls', 'Salads'].includes(category);
                                                setEditItem({ 
                                                    ...editItem, 
                                                    category: category,
                                                    sizes: hasSizes && editItem.sizes?.length > 0 ? editItem.sizes : [{ name: '', price: '' }],
                                                    price: hasSizes ? '' : editItem.price
                                                });
                                            }}
                                        >
                                            <option value="Pizza">Pizza</option>
                                            <option value="Burgers">Burgers</option>
                                            <option value="Shawarma">Shawarma</option>
                                            <option value="Pasta">Pasta</option>
                                            <option value="Pratha Rolls">Pratha Rolls</option>
                                            <option value="Sandwiches">Sandwiches</option>
                                            <option value="Sides">Sides</option>
                                            <option value="Salads">Salads</option>
                                            <option value="Drinks">Drinks</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                        
                                {/* ✅ Size-Specific Price Section for Edit */}
                                {['Pizza', 'Pasta', 'Pratha Rolls', 'Salads'].includes(editItem.category) ? (
                                    <Col md={12}>
                                        <Form.Label className="admin-modal-label fw-bold">Sizes & Prices</Form.Label>
                                        {editItem.sizes && editItem.sizes.length > 0 ? (
                                            editItem.sizes.map((size, index) => (
                                                <Row key={index} className="g-2 mb-2">
                                                    <Col md={6}>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Size name (e.g., Small)"
                                                            className="admin-modal-input"
                                                            value={size.name || ''}
                                                            onChange={(e) => {
                                                                const updatedSizes = [...editItem.sizes];
                                                                updatedSizes[index].name = e.target.value;
                                                                setEditItem({ ...editItem, sizes: updatedSizes });
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="Price"
                                                            className="admin-modal-input"
                                                            value={size.price || ''}
                                                            onChange={(e) => {
                                                                const updatedSizes = [...editItem.sizes];
                                                                updatedSizes[index].price = e.target.value;
                                                                setEditItem({ ...editItem, sizes: updatedSizes });
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col md={2}>
                                                        <Button
                                                            className="admin-modal-remove-btn"
                                                            size="sm"
                                                            onClick={() => {
                                                                const updatedSizes = editItem.sizes.filter((_, i) => i !== index);
                                                                setEditItem({ ...editItem, sizes: updatedSizes });
                                                            }}
                                                            disabled={editItem.sizes.length <= 1}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            ))
                                        ) : (
                                            <Row className="g-2 mb-2">
                                                <Col md={6}>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Size name (e.g., Small)"
                                                        className="admin-modal-input"
                                                        value=""
                                                        onChange={(e) => {
                                                            const updatedSizes = [{ name: e.target.value, price: '' }];
                                                            setEditItem({ ...editItem, sizes: updatedSizes });
                                                        }}
                                                    />
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Price"
                                                        className="admin-modal-input"
                                                        value=""
                                                        onChange={(e) => {
                                                            const updatedSizes = [{ name: editItem.sizes?.[0]?.name || '', price: e.target.value }];
                                                            setEditItem({ ...editItem, sizes: updatedSizes });
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        )}
                                        <Button
                                            className="admin-modal-add-size-btn"
                                            size="sm"
                                            onClick={() => {
                                                const currentSizes = editItem.sizes || [];
                                                setEditItem({ 
                                                    ...editItem, 
                                                    sizes: [...currentSizes, { name: '', price: '' }] 
                                                });
                                            }}
                                        >
                                            + Add Size
                                        </Button>
                                    </Col>
                                ) : (
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="admin-modal-label">Price</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Enter price"
                                                className="admin-modal-input"
                                                value={editItem.price || ''}
                                                onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                )}
                                
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Status</Form.Label>
                                        <Form.Select
                                            className="admin-modal-select"
                                            value={editItem.status}
                                            onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Image Emoji</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="🍕"
                                            className="admin-modal-input"
                                            value={editItem.image}
                                            onChange={(e) => setEditItem({ ...editItem, image: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            className="admin-modal-textarea"
                                            value={editItem.description}
                                            onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="d-flex align-items-center">
                                        <Form.Check
                                            type="switch"
                                            label="Mark as Popular"
                                            className="admin-modal-switch"
                                            checked={editItem.isPopular}
                                            onChange={(e) => setEditItem({ ...editItem, isPopular: e.target.checked })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Update Image</Form.Label>
                                        <div className="admin-modal-upload">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageSelect(e, 'editItem')}
                                                style={{ display: 'none' }}
                                                id="edit-item-image"
                                            />
                                            <label htmlFor="edit-item-image" className="admin-modal-upload-btn">
                                                📁 Change Image
                                            </label>
                                            {editItem.imagePreview && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={editItem.imagePreview} 
                                                        alt="Preview" 
                                                        className="admin-modal-preview"
                                                    />
                                                </div>
                                            )}
                                            {!editItem.imagePreview && editItem.imageUrl && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={editItem.imageUrl} 
                                                        alt="Current" 
                                                        className="admin-modal-preview"
                                                    />
                                                    <p className="admin-modal-upload-text">Current image</p>
                                                </div>
                                            )}
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="admin-modal-cancel" onClick={() => setShowEditItem(false)}>Cancel</Button>
                    <Button className="admin-modal-submit" onClick={handleUpdateItem}>Update Item</Button>
                </Modal.Footer>
            </Modal>

            {/* ===== EDIT DEAL MODAL - NEW THEME ===== */}
            <Modal show={!!showEditDeal} onHide={() => setShowEditDeal(false)} size="lg" className="admin-modal">
                <Modal.Header closeButton>
                    <Modal.Title>✏️ Edit Deal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editDeal && (
                        <Form>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Deal Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="admin-modal-input"
                                            value={editDeal.name}
                                            onChange={(e) => setEditDeal({ ...editDeal, name: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Price</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="admin-modal-input"
                                            value={editDeal.price}
                                            onChange={(e) => setEditDeal({ ...editDeal, price: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Items Included</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows="2"
                                            className="admin-modal-textarea"
                                            value={editDeal.items}
                                            onChange={(e) => setEditDeal({ ...editDeal, items: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Status</Form.Label>
                                        <Form.Select
                                            className="admin-modal-select"
                                            value={editDeal.status}
                                            onChange={(e) => setEditDeal({ ...editDeal, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Update Image</Form.Label>
                                        <div className="admin-modal-upload">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageSelect(e, 'editDeal')}
                                                style={{ display: 'none' }}
                                                id="edit-deal-image"
                                            />
                                            <label htmlFor="edit-deal-image" className="admin-modal-upload-btn">
                                                📁 Change Image
                                            </label>
                                            {editDeal.imagePreview && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={editDeal.imagePreview} 
                                                        alt="Preview" 
                                                        className="admin-modal-preview"
                                                    />
                                                </div>
                                            )}
                                            {!editDeal.imagePreview && editDeal.imageUrl && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={editDeal.imageUrl} 
                                                        alt="Current" 
                                                        className="admin-modal-preview"
                                                    />
                                                    <p className="admin-modal-upload-text">Current image</p>
                                                </div>
                                            )}
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="admin-modal-cancel" onClick={() => setShowEditDeal(false)}>Cancel</Button>
                    <Button className="admin-modal-submit" onClick={handleUpdateDeal}>Update Deal</Button>
                </Modal.Footer>
            </Modal>

            {/* ===== ORDER DETAILS MODAL - NEW THEME ===== */}
            <Modal show={!!showOrderDetails} onHide={() => setShowOrderDetails(null)} size="lg" className="admin-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Order Details - {showOrderDetails?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showOrderDetails && (
                        <>
                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <Badge className={`admin-status-${showOrderDetails.status?.toLowerCase() || 'pending'}`}>
                                        {showOrderDetails.status}
                                    </Badge>
                                    <span className="ms-3 text-secondary">📅 {showOrderDetails.date}</span>
                                </div>
                                <div>
                                    <span className="fw-bold">Total: Rs. {showOrderDetails.total.toLocaleString()}</span>
                                </div>
                            </div>

                            <Table striped className="admin-modal-table mb-3 ">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {showOrderDetails.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>Rs. {item.price}</td>
                                            <td>Rs. {item.price * item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="fw-bold">
                                        <td colSpan="3" className="text-end">Total</td>
                                        <td>Rs. {showOrderDetails.total.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </Table>

                            <div className="bg-dark-light p-3 rounded-3 mb-3">
                                <Row>
                                    <Col md={6}>
                                        <p className="mb-1"><strong>👤 Customer:</strong> {showOrderDetails.customer}</p>
                                        <p className="mb-1"><strong>💳 Payment:</strong> {showOrderDetails.payment}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p className="mb-1"><strong>📍 Address:</strong> {showOrderDetails.address}</p>
                                        <p className="mb-0"><strong>📞 Phone:</strong> {showOrderDetails.phone}</p>
                                    </Col>
                                </Row>
                            </div>

                            {/* Order Timeline */}
                            <h6 className="fw-bold mb-3">⏰ Order Progress</h6>
                            <div className="order-timeline">
                                {[
                                    { status: 'Order Placed', key: 'pending', completed: true },
                                    { status: 'Preparing Food', key: 'preparing', completed: ['Preparing', 'On Delivery', 'Delivered'].includes(showOrderDetails.status) },
                                    { status: 'On Delivery', key: 'delivering', completed: ['On Delivery', 'Delivered'].includes(showOrderDetails.status) },
                                    { status: 'Delivered', key: 'delivered', completed: showOrderDetails.status === 'Delivered' },
                                    { status: 'Cancelled', key: 'cancelled', completed: showOrderDetails.status === 'Cancelled' },
                                ].map((step, idx) => (
                                    <div key={idx} className="d-flex gap-3 pb-3 border-bottom">
                                        <div className="flex-shrink-0">
                                            <div 
                                                className="rounded-circle d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    background: step.completed ? (showOrderDetails.status === 'Cancelled' ? '#da3633' : '#2ea043') : '#21262d',
                                                    color: step.completed ? 'white' : '#8b949e',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {step.completed ? (showOrderDetails.status === 'Cancelled' ? '✕' : '✓') : idx + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <p className={`fw-semibold mb-0 ${step.completed ? (showOrderDetails.status === 'Cancelled' ? 'text-danger' : 'text-light') : 'text-secondary'}`}>
                                                {step.status}
                                                {step.completed && showOrderDetails.status === 'Cancelled' && (
                                                    <span className="ms-2 text-danger small">(Cancelled)</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 d-flex gap-2">
                                <Button className="admin-modal-cancel" onClick={() => setShowOrderDetails(null)}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* ===== FEEDBACK DETAILS MODAL - NEW THEME ===== */}
            <Modal show={!!showFeedbackDetails} onHide={() => setShowFeedbackDetails(null)} size="lg" className="admin-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Feedback Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showFeedbackDetails && (
                        <>
                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <h6 className="fw-bold">{showFeedbackDetails.name}</h6>
                                    <p className="text-secondary mb-0">{showFeedbackDetails.email}</p>
                                </div>
                                <Badge className={`admin-status-${showFeedbackDetails.status?.toLowerCase() || 'pending'}`}>
                                    {showFeedbackDetails.status || 'pending'}
                                </Badge>
                            </div>

                            <div className="mb-3">
                                <strong>Rating:</strong>
                                <div className="mt-1">
                                    {'⭐'.repeat(showFeedbackDetails.rating)}
                                    {'☆'.repeat(5 - showFeedbackDetails.rating)}
                                </div>
                            </div>

                            <div className="mb-3">
                                <strong>Review:</strong>
                                <p className="text-secondary mt-1">{showFeedbackDetails.review}</p>
                            </div>

                            {showFeedbackDetails.location && (
                                <div className="mb-3">
                                    <strong>Location:</strong>
                                    <p className="text-secondary mt-1">{showFeedbackDetails.location}</p>
                                </div>
                            )}

                            <div className="mb-3">
                                <strong>Order ID:</strong>
                                <p className="text-secondary mt-1">{showFeedbackDetails.orderId}</p>
                            </div>

                            <div className="mb-3">
                                <strong>Submitted:</strong>
                                <p className="text-secondary mt-1">
                                    {new Date(showFeedbackDetails.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="d-flex gap-2 mt-3">
                                {showFeedbackDetails.status !== 'approved' && (
                                    <Button 
                                        className="admin-modal-submit"
                                        onClick={() => {
                                            handleApproveFeedback(showFeedbackDetails._id);
                                            setShowFeedbackDetails(null);
                                        }}
                                    >
                                        ✅ Approve Feedback
                                    </Button>
                                )}
                                <Button 
                                    className="admin-modal-cancel"
                                    onClick={() => setShowFeedbackDetails(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* ===== USER DETAILS MODAL - NEW THEME ===== */}
            <Modal show={!!showUserDetails} onHide={() => setShowUserDetails(null)} size="lg" className="admin-modal">
                <Modal.Header closeButton>
                    <Modal.Title>👤 User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showUserDetails && (
                        <>
                            <Row className="mb-3 g-3">
                                <Col lg={6} md={12}>
                                    <div className="bg-dark-light p-3 rounded-3">
                                        <h6 className="fw-bold text-secondary mb-3">Personal Information</h6>
                                        <p className="mb-2"><strong>Name:</strong> {showUserDetails.name}</p>
                                        <p className="mb-2"><strong>Email:</strong> {showUserDetails.email}</p>
                                        <p className="mb-2"><strong>Phone:</strong> {showUserDetails.phone}</p>
                                        <p className="mb-2"><strong>Address:</strong> {showUserDetails.address || 'N/A'}</p>
                                        <p className="mb-0"><strong>City:</strong> {showUserDetails.city || 'N/A'}</p>
                                    </div>
                                </Col>
                                <Col lg={6} md={12}>
                                    <div className="bg-dark-light p-3 rounded-3">
                                        <h6 className="fw-bold text-secondary mb-3">Account Information</h6>
                                        <p className="mb-2"><strong>Role:</strong> 
                                            <Badge className={showUserDetails.role === 'admin' ? 'admin-role-admin' : 'admin-role-user'}>
                                                {showUserDetails.role}
                                            </Badge>
                                        </p>
                                        <p className="mb-2"><strong>Status:</strong> 
                                            <Badge className={`admin-status-${showUserDetails.status?.toLowerCase() || 'active'}`}>
                                                {showUserDetails.status || 'active'}
                                            </Badge>
                                        </p>
                                        <p className="mb-2"><strong>Verified:</strong> 
                                            <Badge className={showUserDetails.isVerified ? 'admin-status-active' : 'admin-status-inactive'}>
                                                {showUserDetails.isVerified ? '✅ Verified' : '❌ Not Verified'}
                                            </Badge>
                                        </p>
                                        <p className="mb-2"><strong>Joined:</strong> {new Date(showUserDetails.createdAt).toLocaleDateString()}</p>
                                        <p className="mb-0"><strong>User ID:</strong> <span className="text-secondary small">{showUserDetails._id}</span></p>
                                    </div>
                                </Col>
                            </Row>
                    
                            {/* Addresses */}
                            {showUserDetails.addresses && showUserDetails.addresses.length > 0 && (
                                <div className="mb-3">
                                    <h6 className="fw-bold text-secondary mb-2">📍 Saved Addresses</h6>
                                    <div className="bg-dark-light p-3 rounded-3">
                                        {showUserDetails.addresses.map((addr, idx) => (
                                            <div key={idx} className="d-flex justify-content-between border-bottom py-1">
                                                <span>{addr.address}</span>
                                                {addr.default && <Badge className="admin-status-active">Default</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payments */}
                            {showUserDetails.payments && showUserDetails.payments.length > 0 && (
                                <div className="mb-3">
                                    <h6 className="fw-bold text-secondary mb-2">💳 Payment Methods</h6>
                                    <div className="bg-dark-light p-3 rounded-3">
                                        {showUserDetails.payments.map((pay, idx) => (
                                            <div key={idx} className="d-flex justify-content-between border-bottom py-1">
                                                <span>{pay.label || `${pay.type} - ${pay.accountNo}`}</span>
                                                {pay.default && <Badge className="admin-status-active">Default</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Order Stats */}
                            <div className="bg-dark-light p-3 rounded-3">
                                <h6 className="fw-bold text-secondary mb-2">📦 Order Statistics</h6>
                                <Row>
                                    <Col md={4}>
                                        <p className="mb-0"><strong>Total Orders:</strong> {showUserDetails.totalOrders || 0}</p>
                                    </Col>
                                    <Col md={4}>
                                        <p className="mb-0"><strong>Total Spent:</strong> Rs. {showUserDetails.totalSpent?.toLocaleString() || 0}</p>
                                    </Col>
                                    <Col md={4}>
                                        <p className="mb-0"><strong>Average Rating:</strong> {showUserDetails.averageRating || 0}★</p>
                                    </Col>
                                </Row>
                            </div>
                        
                            {/* Actions */}
                            <div className="mt-3 d-flex gap-2">
                                <Button 
                                    className="admin-modal-delete"
                                    size="sm"
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete ${showUserDetails.name}?`)) {
                                            deleteUser(showUserDetails._id);
                                            setShowUserDetails(null);
                                        }
                                    }}
                                >
                                    🗑️ Delete User
                                </Button>
                                <Button className="admin-modal-cancel" size="sm" onClick={() => setShowUserDetails(null)}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* ===== ADD CATEGORY MODAL - NEW THEME ===== */}
            <Modal show={showAddCategory} onHide={() => setShowAddCategory(false)} size="lg" className="admin-modal">
                <Modal.Header closeButton>
                    <Modal.Title>➕ Add Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Category Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter category name"
                                        className="admin-modal-input"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Icon (Emoji)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="🍕"
                                        className="admin-modal-input"
                                        value={newCategory.icon}
                                        onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Color</Form.Label>
                                    <Form.Control
                                        type="color"
                                        className="admin-modal-input"
                                        value={newCategory.color}
                                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Item Count</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="12 items"
                                        className="admin-modal-input"
                                        value={newCategory.count}
                                        onChange={(e) => setNewCategory({ ...newCategory, count: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="admin-modal-label">Category Image</Form.Label>
                                    <div className="admin-modal-upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleCategoryImageSelect(e)}
                                            style={{ display: 'none' }}
                                            id="category-image-upload"
                                        />
                                        <label htmlFor="category-image-upload" className="admin-modal-upload-btn">
                                            📁 Choose Image
                                        </label>
                                        {newCategory.imagePreview && (
                                            <div className="mt-2">
                                                <img 
                                                    src={newCategory.imagePreview} 
                                                    alt="Preview" 
                                                    className="admin-modal-preview"
                                                />
                                            </div>
                                        )}
                                        {!newCategory.imagePreview && (
                                            <p className="admin-modal-upload-text">No image selected. Emoji will be used as fallback.</p>
                                        )}
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="admin-modal-cancel" onClick={() => setShowAddCategory(false)}>Cancel</Button>
                    <Button className="admin-modal-submit" onClick={handleAddCategory}>Add Category</Button>
                </Modal.Footer>
            </Modal>

            {/* ===== EDIT CATEGORY MODAL - NEW THEME ===== */}
            <Modal show={showEditCategory} onHide={() => setShowEditCategory(false)} size="lg" className="admin-modal">
                <Modal.Header closeButton>
                    <Modal.Title>✏️ Edit Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editCategory && (
                        <Form>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Category Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="admin-modal-input"
                                            value={editCategory.name}
                                            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Icon (Emoji)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="admin-modal-input"
                                            value={editCategory.icon}
                                            onChange={(e) => setEditCategory({ ...editCategory, icon: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Color</Form.Label>
                                        <Form.Control
                                            type="color"
                                            className="admin-modal-input"
                                            value={editCategory.color}
                                            onChange={(e) => setEditCategory({ ...editCategory, color: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Item Count</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="admin-modal-input"
                                            value={editCategory.count}
                                            onChange={(e) => setEditCategory({ ...editCategory, count: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="admin-modal-label">Update Image</Form.Label>
                                        <div className="admin-modal-upload">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setEditCategory({
                                                                ...editCategory,
                                                                imageFile: file,
                                                                imagePreview: reader.result
                                                            });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                style={{ display: 'none' }}
                                                id="edit-category-image"
                                            />
                                            <label htmlFor="edit-category-image" className="admin-modal-upload-btn">
                                                📁 Change Image
                                            </label>
                                            {editCategory.imagePreview && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={editCategory.imagePreview} 
                                                        alt="Preview" 
                                                        className="admin-modal-preview"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="admin-modal-cancel" onClick={() => setShowEditCategory(false)}>Cancel</Button>
                    <Button className="admin-modal-submit" onClick={handleUpdateCategory}>Update Category</Button>
                </Modal.Footer>
            </Modal>

            <Footer />

            <style>{`
                /* ============================================
                   ADMIN PANEL - SPECIAL DARK THEME
                   ============================================ */
                
                /* ===== MAIN BACKGROUND ===== */
                .admin-panel {
                    background: #0d1117;
                    min-height: 100vh;
                    color: #e6edf3;
                    padding: 20px 0;
                }

                /* ===== HEADER ===== */
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding: 16px 24px;
                    background: #161b22;
                    border-radius: 12px;
                    border: 1px solid #30363d;
                }

                .admin-header-title {
                    font-weight: 700;
                    color: #f0f6fc;
                    margin-bottom: 0;
                }

                .admin-header-badge {
                    background: linear-gradient(135deg, #da3633, #f0883e) !important;
                    color: white !important;
                    padding: 8px 20px;
                    border-radius: 50px;
                    font-size: 14px;
                    font-weight: 600;
                }

                /* ===== SIDEBAR ===== */
                .admin-sidebar-card {
                    background: #161b22 !important;
                    border: 1px solid #30363d !important;
                    border-radius: 12px !important;
                    box-shadow: none !important;
                }

                .admin-nav-link {
                    color: #8b949e !important;
                    padding: 10px 16px !important;
                    border-radius: 8px !important;
                    margin-bottom: 4px;
                    transition: all 0.3s ease;
                    font-weight: 500 !important;
                }

                .admin-nav-link:hover {
                    background: #21262d !important;
                    color: #f0f6fc !important;
                }

                .admin-nav-link.active {
                    background: #21262d !important;
                    color: #f0883e !important;
                    border-left: 3px solid #f0883e;
                }

                /* ===== STAT CARDS ===== */
                .admin-stat-card {
                    background: #161b22 !important;
                    border: 1px solid #30363d !important;
                    border-radius: 12px !important;
                    box-shadow: none !important;
                    text-align: center;
                    padding: 8px;
                    transition: all 0.3s ease;
                }

                .admin-stat-card:hover {
                    border-color: #f0883e !important;
                    transform: translateY(-4px);
                }

                .admin-stat-icon {
                    font-size: 32px;
                    margin-bottom: 8px;
                }

                .admin-stat-number {
                    font-weight: 700;
                    color: #f0f6fc;
                    font-size: 28px;
                }

                .admin-stat-label {
                    color: #8b949e;
                    margin-bottom: 0;
                    font-size: 14px;
                }

                .admin-stat-card-secondary {
                    background: #161b22 !important;
                    border: 1px solid #30363d !important;
                    border-radius: 12px !important;
                    box-shadow: none !important;
                    padding: 8px;
                }

                .admin-stat-subtitle {
                    font-weight: 600;
                    color: #8b949e;
                }

                .admin-stat-highlight {
                    font-weight: 700;
                    color: #f0883e;
                    font-size: 32px;
                }

                .admin-stat-small {
                    color: #8b949e;
                }

                /* ===== TOOLBAR ===== */
                .admin-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .admin-toolbar-title {
                    font-weight: 700;
                    color: #f0f6fc;
                    margin-bottom: 0;
                }

                .admin-toolbar-controls {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .admin-filter-select {
                    background: #0d1117 !important;
                    color: #e6edf3 !important;
                    border: 1px solid #30363d !important;
                    border-radius: 8px !important;
                    padding: 6px 12px !important;
                    width: 150px;
                }

                .admin-filter-select:focus {
                    border-color: #f0883e !important;
                    box-shadow: 0 0 0 3px rgba(240, 136, 62, 0.2) !important;
                }

                .admin-search-input {
                    background: #0d1117 !important;
                    color: #e6edf3 !important;
                    border: 1px solid #30363d !important;
                    border-radius: 8px !important;
                    padding: 6px 12px !important;
                    width: 200px;
                }

                .admin-search-input:focus {
                    border-color: #f0883e !important;
                    box-shadow: 0 0 0 3px rgba(240, 136, 62, 0.2) !important;
                }

                .admin-search-input::placeholder {
                    color: #8b949e;
                }

                .admin-add-btn {
                    background: linear-gradient(135deg, #da3633, #f0883e) !important;
                    border: none !important;
                    color: white !important;
                    padding: 8px 20px;
                    border-radius: 50px !important;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .admin-add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(240, 136, 62, 0.3);
                }

                .admin-pending-badge {
                    background: #f0883e !important;
                    color: #0d1117 !important;
                    padding: 8px 16px;
                    border-radius: 50px;
                    font-weight: 600;
                }

                /* ===== TABLES ===== */
                .admin-table-wrapper {
                    background: #161b22;
                    border-radius: 12px;
                    border: 1px solid #30363d;
                    overflow: hidden;
                }

                .admin-table {
                    color: #e6edf3 !important;
                    margin-bottom: 0;
                }

                .admin-table thead {
                    background: #0d1117;
                }

                .admin-table thead th {
                    color: #8b949e;
                    font-weight: 600;
                    border-bottom: 1px solid #30363d;
                    padding: 12px 16px;
                }

                .admin-table tbody td {
                    padding: 12px 16px;
                    vertical-align: middle;
                    border-bottom: 1px solid #21262d;
                }

                .admin-table tbody tr:hover {
                    background: #21262d !important;
                }

                /* ===== THUMBNAILS ===== */
                .admin-thumbnail {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 1px solid #30363d;
                }

                .admin-thumbnail-emoji {
                    font-size: 28px;
                }

                /* ===== STATUS BADGES ===== */
                .admin-status-active {
                    background: #2ea043 !important;
                    color: white !important;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .admin-status-inactive {
                    background: #8b949e !important;
                    color: #0d1117 !important;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .admin-status-pending {
                    background: #f0883e !important;
                    color: #0d1117 !important;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .admin-status-preparing {
                    background: #58a6ff !important;
                    color: #0d1117 !important;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .admin-status-on-delivery {
                    background: #1f6feb !important;
                    color: white !important;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .admin-status-delivered {
                    background: #2ea043 !important;
                    color: white !important;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .admin-status-cancelled {
                    background: #da3633 !important;
                    color: white !important;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .admin-role-admin {
                    background: #da3633 !important;
                    color: white !important;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .admin-role-user {
                    background: #8b949e !important;
                    color: #0d1117 !important;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                }

                /* ===== SIZE & PRICE BADGES ===== */
                .admin-size-badge {
                    background: #21262d !important;
                    color: #e6edf3 !important;
                    border: 1px solid #30363d;
                    padding: 4px 10px;
                    border-radius: 50px;
                    font-size: 11px;
                    margin-right: 4px;
                    margin-bottom: 4px;
                }

                .admin-price-badge {
                    background: #21262d !important;
                    color: #f0883e !important;
                    border: 1px solid #30363d;
                    padding: 4px 12px;
                    border-radius: 50px;
                }

                /* ===== POPULAR BADGES ===== */
                .admin-popular-active {
                    background: #f0883e !important;
                    color: #0d1117 !important;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .admin-popular-inactive {
                    background: #21262d !important;
                    color: #8b949e !important;
                    border: 1px solid #30363d;
                    padding: 4px 12px;
                    border-radius: 50px;
                    cursor: pointer;
                }

                /* ===== ACTION BUTTONS ===== */
                .admin-action-btn {
                    background: #21262d !important;
                    border: 1px solid #30363d !important;
                    color: #8b949e !important;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }

                .admin-action-btn:hover {
                    border-color: #f0883e !important;
                    color: #f0f6fc !important;
                }

                .admin-action-btn.admin-action-view:hover {
                    border-color: #58a6ff !important;
                    color: #58a6ff !important;
                }

                .admin-action-btn.admin-action-edit:hover {
                    border-color: #f0883e !important;
                    color: #f0883e !important;
                }

                .admin-action-btn.admin-action-delete:hover {
                    border-color: #da3633 !important;
                    color: #da3633 !important;
                }

                .admin-action-btn.admin-action-toggle:hover {
                    border-color: #8b949e !important;
                    color: #f0f6fc !important;
                }

                .admin-action-btn.admin-action-approve:hover {
                    border-color: #2ea043 !important;
                    color: #2ea043 !important;
                }

                .admin-status-select {
                    background: #0d1117 !important;
                    color: #e6edf3 !important;
                    border: 1px solid #30363d !important;
                    border-radius: 6px !important;
                    padding: 4px 8px !important;
                    font-size: 12px;
                    width: 130px;
                }

                .admin-status-select:focus {
                    border-color: #f0883e !important;
                    box-shadow: 0 0 0 3px rgba(240, 136, 62, 0.2) !important;
                }

                .admin-status-select:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* ============================================
                   MODALS - DARK THEME
                   ============================================ */
                .admin-modal .modal-content {
                    background: #161b22 !important;
                    border: 1px solid #30363d !important;
                    border-radius: 12px !important;
                    color: #e6edf3;
                }

                .admin-modal .modal-header {
                    border-bottom: 1px solid #30363d !important;
                    padding: 16px 20px;
                }

                .admin-modal .modal-header .btn-close {
                    filter: invert(1);
                }

                .admin-modal .modal-title {
                    color: #f0f6fc;
                    font-weight: 700;
                }

                .admin-modal .modal-body {
                    padding: 20px;
                }

                .admin-modal .modal-footer {
                    border-top: 1px solid #30363d !important;
                    padding: 16px 20px;
                }

                .admin-modal-label {
                    color: #e6edf3;
                    font-weight: 600;
                    font-size: 14px;
                }

                .admin-modal-input {
                    background: #0d1117 !important;
                    color: #e6edf3 !important;
                    border: 1px solid #30363d !important;
                    border-radius: 8px !important;
                    padding: 10px 14px !important;
                }

                .admin-modal-input:focus {
                    border-color: #f0883e !important;
                    box-shadow: 0 0 0 3px rgba(240, 136, 62, 0.2) !important;
                }

                .admin-modal-textarea {
                    background: #0d1117 !important;
                    color: #e6edf3 !important;
                    border: 1px solid #30363d !important;
                    border-radius: 8px !important;
                    padding: 10px 14px !important;
                    min-height: 80px;
                    resize: vertical;
                }

                .admin-modal-textarea:focus {
                    border-color: #f0883e !important;
                    box-shadow: 0 0 0 3px rgba(240, 136, 62, 0.2) !important;
                }

                .admin-modal-select {
                    background: #0d1117 !important;
                    color: #e6edf3 !important;
                    border: 1px solid #30363d !important;
                    border-radius: 8px !important;
                    padding: 10px 14px !important;
                }

                .admin-modal-select:focus {
                    border-color: #f0883e !important;
                    box-shadow: 0 0 0 3px rgba(240, 136, 62, 0.2) !important;
                }

                .admin-modal-select option {
                    background: #0d1117;
                    color: #e6edf3;
                }

                .admin-modal-switch .form-check-input:checked {
                    background-color: #f0883e;
                    border-color: #f0883e;
                }

                .admin-modal-upload {
                    background: #0d1117;
                    border: 2px dashed #30363d;
                    border-radius: 8px;
                    padding: 16px;
                    text-align: center;
                }

                .admin-modal-upload-btn {
                    background: #21262d;
                    color: #e6edf3;
                    padding: 8px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-block;
                }

                .admin-modal-upload-btn:hover {
                    background: #30363d;
                }

                .admin-modal-preview {
                    max-width: 150px;
                    max-height: 150px;
                    object-fit: cover;
                    border-radius: 8px;
                    margin-top: 8px;
                }

                .admin-modal-upload-text {
                    color: #8b949e;
                    font-size: 12px;
                    margin-top: 8px;
                }

                .admin-modal-remove-btn {
                    background: #21262d !important;
                    border: 1px solid #30363d !important;
                    color: #8b949e !important;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }

                .admin-modal-remove-btn:hover:not(:disabled) {
                    border-color: #da3633 !important;
                    color: #da3633 !important;
                }

                .admin-modal-remove-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .admin-modal-add-size-btn {
                    background: #21262d !important;
                    border: 1px solid #30363d !important;
                    color: #e6edf3 !important;
                    padding: 4px 16px;
                    border-radius: 50px !important;
                    font-size: 12px;
                    transition: all 0.3s ease;
                }

                .admin-modal-add-size-btn:hover {
                    border-color: #f0883e !important;
                    color: #f0883e !important;
                }

                .admin-modal-cancel {
                    background: transparent !important;
                    border: 1px solid #30363d !important;
                    color: #8b949e !important;
                    padding: 8px 24px;
                    border-radius: 50px !important;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .admin-modal-cancel:hover {
                    border-color: #8b949e !important;
                    color: #f0f6fc !important;
                }

                .admin-modal-submit {
                    background: linear-gradient(135deg, #da3633, #f0883e) !important;
                    border: none !important;
                    color: white !important;
                    padding: 8px 24px;
                    border-radius: 50px !important;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .admin-modal-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(240, 136, 62, 0.3);
                }

                .admin-modal-delete {
                    background: transparent !important;
                    border: 1px solid #da3633 !important;
                    color: #da3633 !important;
                    padding: 8px 24px;
                    border-radius: 50px !important;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .admin-modal-delete:hover {
                    background: #da3633 !important;
                    color: white !important;
                }

                .bg-dark-light {
                    background: #21262d;
                }

                .admin-modal-table {
                    color: #e6edf3;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .admin-modal-table thead {
                    background: #0d1117;
                }

                .admin-modal-table thead th {
                    color: #8b949e;
                    font-weight: 600;
                }

                .admin-modal-table tbody td {
                    color: #1c1c1d;
                }

                /* ============================================
                   ORDER TIMELINE
                   ============================================ */
                .order-timeline {
                    max-height: 300px;
                    overflow-y: auto;
                    padding-right: 4px;
                }

                .order-timeline .border-bottom {
                    border-color: #30363d !important;
                }

                .order-timeline .border-bottom:last-child {
                    border-bottom: none !important;
                    padding-bottom: 0 !important;
                }

                .order-timeline::-webkit-scrollbar {
                    width: 4px;
                }

                .order-timeline::-webkit-scrollbar-track {
                    background: #0d1117;
                    border-radius: 4px;
                }

                .order-timeline::-webkit-scrollbar-thumb {
                    background: #30363d;
                    border-radius: 4px;
                }

                .order-timeline::-webkit-scrollbar-thumb:hover {
                    background: #f0883e;
                }

                .cursor-pointer {
                    cursor: pointer;
                }

                /* ============================================
                   RESPONSIVE
                   ============================================ */
                @media (max-width: 768px) {
                    .admin-panel {
                        padding: 12px 0;
                    }

                    .admin-header {
                        flex-direction: column;
                        gap: 12px;
                        text-align: center;
                        padding: 12px 16px;
                    }

                    .admin-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 8px;
                    }

                    .admin-toolbar-controls {
                        flex-direction: column;
                    }

                    .admin-filter-select,
                    .admin-search-input {
                        width: 100% !important;
                    }

                    .admin-stat-number {
                        font-size: 24px;
                    }

                    .admin-stat-highlight {
                        font-size: 28px;
                    }

                    .admin-table-wrapper {
                        overflow-x: auto;
                    }

                    .admin-table {
                        font-size: 12px;
                    }

                    .admin-table thead th,
                    .admin-table tbody td {
                        padding: 8px 10px;
                    }

                    .admin-status-select {
                        width: 100px;
                        font-size: 11px;
                    }

                    .admin-modal .modal-body {
                        padding: 12px;
                    }
                }

                @media (max-width: 576px) {
                    .admin-panel {
                        padding: 8px 0;
                    }

                    .admin-header-title {
                        font-size: 20px;
                    }

                    .admin-stat-number {
                        font-size: 20px;
                    }

                    .admin-stat-highlight {
                        font-size: 24px;
                    }

                    .admin-thumbnail {
                        width: 36px;
                        height: 36px;
                    }

                    .admin-thumbnail-emoji {
                        font-size: 20px;
                    }

                    .admin-action-btn {
                        padding: 2px 6px;
                        font-size: 12px;
                    }

                    .admin-sidebar-card .nav-link {
                        padding: 6px 12px !important;
                        font-size: 13px;
                    }
                }
            `}</style>
        </>
    );
};

export default AdminPanel;