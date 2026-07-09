import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { feedbackAPI } from '../src/api';

const Testimonials = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [feedbacks, setFeedbacks] = useState([]);
    const [expandedReviews, setExpandedReviews] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        averageRating: 0,
        recommendRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const response = await feedbackAPI.getFeedbacks(4);
            if (response.data.status === 1) {
                setFeedbacks(response.data.data.feedbacks || []);
                setStats(response.data.data.stats || { total: 0, averageRating: 0, recommendRate: 0 });
            }
        } catch (error) {
            console.error('Feedback Error:', error);
            // Fallback static data...
            setFeedbacks([
                {
                    _id: '1',
                    name: 'Ahmad Khan',
                    location: 'Harnoli City',
                    rating: 5,
                    review: 'Best food in Harnoli! The pizza is amazing and delivery is always on time. Highly recommend the Family Deal!',
                    avatar: '👨',
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    isVerified: true
                },
                {
                    _id: '2',
                    name: 'Fatima Ali',
                    location: 'Harnoli',
                    rating: 5,
                    review: 'The shawarma is absolutely delicious! Always fresh and the garlic sauce is perfect. Will order again!',
                    avatar: '👩',
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    isVerified: true
                },
                {
                    _id: '3',
                    name: 'Usman Malik',
                    location: 'Mianwali',
                    rating: 4,
                    review: 'Great food and fast delivery. The burgers are juicy and the fries are crispy. Definitely my go-to place!',
                    avatar: '👨',
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    isVerified: false
                },
                {
                    _id: '4',
                    name: 'Sana Ahmed',
                    location: 'Harnoli City',
                    rating: 5,
                    review: 'Love the pasta and the deals are amazing. The family pack is perfect for our gatherings. Highly recommended!',
                    avatar: '👩',
                    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    isVerified: true
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const toggleReadMore = (id) => {
        setExpandedReviews(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const formatDate = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    };

    const truncateText = (text, maxLength = 80) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <section className="testimonials-section py-5">
                <Container>
                    <div className="section-header">
                        <Badge className="badge-success-custom">💬 WHAT PEOPLE SAY</Badge>
                        <h2>Our Happy Customers</h2>
                        <p>Real reviews from real people who love our food.</p>
                    </div>
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="danger" />
                    </div>
                </Container>
            </section>
        );
    }

    return (
        <>
            <section className="testimonials-section py-5">
                <Container>
                    {/* Section Header - Using theme classes */}
                    <div className="section-header">
                        <Badge className="badge-success-custom">💬 WHAT PEOPLE SAY</Badge>
                        <h2>Our Happy Customers</h2>
                        <p>Real reviews from real people who love our food.</p>
                    </div>

                    {/* Testimonials Grid */}
                    <Row className="g-4">
                        {feedbacks.length === 0 ? (
                            <Col>
                                <div className="text-center py-4">
                                    <p className="text-secondary">No reviews yet. Be the first to review!</p>
                                </div>
                            </Col>
                        ) : (
                            feedbacks.map((testimonial, index) => {
                                const isExpanded = expandedReviews[testimonial._id] || false;
                                const reviewText = testimonial.review || '';
                                const shouldTruncate = reviewText.length > 80;
                                const displayText = isExpanded ? reviewText : truncateText(reviewText, 80);

                                return (
                                    <Col key={testimonial._id} lg={3} md={6}>
                                        <div 
                                            className={`testimonial-card p-4 rounded-4 h-100 ${activeIndex === index ? 'testimonial-active' : ''}`}
                                        >
                                            {/* Header */}
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <div className="testimonial-avatar">
                                                    {testimonial.avatar || '👤'}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <h6 className="fw-bold mb-0 testimonial-name">
                                                        {testimonial.name}
                                                    </h6>
                                                    <small className="testimonial-location">
                                                        {testimonial.location || 'Harnoli'}
                                                    </small>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="mb-2">
                                                {'⭐'.repeat(testimonial.rating)}
                                                {'☆'.repeat(5 - testimonial.rating)}
                                                {testimonial.isVerified && (
                                                    <span className="badge-verified">✓ Verified</span>
                                                )}
                                            </div>

                                            {/* Review with fixed height and Read More */}
                                            <div className={`testimonial-review ${isExpanded ? 'expanded' : ''}`}>
                                                "{displayText}"
                                            </div>

                                            {/* Read More Button */}
                                            {shouldTruncate && (
                                                <button 
                                                    className="btn-read-more"
                                                    onClick={() => toggleReadMore(testimonial._id)}
                                                >
                                                    {isExpanded ? 'Show Less ↑' : 'Read More →'}
                                                </button>
                                            )}

                                            {/* Footer */}
                                            <div className="testimonial-footer">
                                                <small className="text-secondary">{formatDate(testimonial.createdAt)}</small>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })
                        )}
                    </Row>

                    {/* Rating Summary */}
                    <div className="text-center mt-5">
                        <div className="rating-summary">
                            <div className="rating-item">
                                <span className="rating-number">{stats.averageRating || 4.9}★</span>
                                <span className="rating-label">Average Rating</span>
                            </div>
                            <div className="rating-divider" />
                            <div className="rating-item">
                                <span className="rating-number">{stats.total || 500}+</span>
                                <span className="rating-label">Reviews</span>
                            </div>
                            <div className="rating-divider" />
                            <div className="rating-item">
                                <span className="rating-number">{stats.recommendRate || 98}%</span>
                                <span className="rating-label">Recommend</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <style>{`
                /* ===== TESTIMONIALS SECTION ===== */
                .testimonials-section {
                    background: var(--light);
                    padding: 60px 0;
                }

                .testimonials-section .section-header {
                    text-align: center;
                    margin-bottom: var(--space-2xl);
                }

                .testimonials-section .section-header .badge {
                    font-size: var(--font-sm);
                    padding: 8px 24px;
                    border-radius: var(--radius-full);
                    margin-bottom: var(--space-md);
                    display: inline-block;
                }

                .testimonials-section .section-header h2 {
                    font-size: var(--font-3xl);
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: var(--space-sm);
                }

                .testimonials-section .section-header p {
                    color: var(--text-secondary);
                    font-size: var(--font-lg);
                    max-width: 500px;
                    margin: 0 auto;
                }

                /* ===== BADGE ===== */
                .badge-success-custom {
                    background: var(--accent-gradient) !important;
                    color: white !important;
                    padding: 8px 24px;
                    border-radius: var(--radius-full);
                    font-weight: 600;
                }

                /* ===== TESTIMONIAL CARDS ===== */
                .testimonial-card {
                    background: var(--light-card);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    border-radius: var(--radius-lg);
                    transition: all var(--transition-normal);
                    display: flex;
                    flex-direction: column;
                    box-shadow: var(--shadow-sm);
                }

                .testimonial-card:hover {
                    box-shadow: var(--shadow-lg) !important;
                    transform: translateY(-5px) !important;
                }

                .testimonial-card.testimonial-active {
                    box-shadow: var(--shadow-md) !important;
                    transform: translateY(-5px);
                }

                /* ===== AVATAR ===== */
                .testimonial-avatar {
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

                .testimonial-card:hover .testimonial-avatar {
                    background: var(--secondary);
                    transform: scale(1.05);
                }

                /* ===== NAME & LOCATION ===== */
                .testimonial-name {
                    color: var(--text-primary);
                    word-break: break-word;
                }

                .testimonial-location {
                    color: var(--text-secondary);
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 120px;
                }

                /* ===== VERIFIED BADGE ===== */
                .badge-verified {
                    background: var(--success) !important;
                    color: white !important;
                    font-size: 10px;
                    padding: 3px 8px;
                    border-radius: var(--radius-full);
                    margin-left: 6px;
                }

                /* ===== REVIEW TEXT ===== */
                .testimonial-review {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    min-height: 60px;
                    max-height: 80px;
                    overflow: hidden;
                    flex: 1;
                    transition: all var(--transition-normal);
                }

                .testimonial-review.expanded {
                    max-height: none;
                }

                /* ===== READ MORE BUTTON ===== */
                .btn-read-more {
                    background: transparent;
                    border: none;
                    color: var(--primary);
                    font-weight: 700;
                    font-size: 13px;
                    padding: 4px 0;
                    align-self: flex-start;
                    transition: all var(--transition-normal);
                }

                .btn-read-more:hover {
                    color: var(--primary-dark);
                    transform: translateX(3px);
                }

                /* ===== FOOTER ===== */
                .testimonial-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                }

                /* ===== RATING SUMMARY ===== */
                .rating-summary {
                    display: inline-flex;
                    align-items: center;
                    gap: 24px;
                    background: var(--light-card);
                    padding: 16px 32px;
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow-md);
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .rating-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .rating-number {
                    font-size: var(--font-xl);
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .rating-label {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .rating-divider {
                    width: 1px;
                    height: 30px;
                    background: var(--text-muted);
                    opacity: 0.3;
                }

                /* ===== DARK THEME ===== */
                [data-theme="dark"] .testimonial-card {
                    background: var(--dark-card);
                    border-color: rgba(255, 255, 255, 0.05);
                }

                [data-theme="dark"] .testimonial-avatar {
                    background: var(--dark-light);
                }

                [data-theme="dark"] .testimonial-card:hover .testimonial-avatar {
                    background: var(--secondary);
                }

                [data-theme="dark"] .rating-summary {
                    background: var(--dark-card);
                }

                [data-theme="dark"] .testimonial-footer {
                    border-top-color: rgba(255, 255, 255, 0.05);
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 992px) {
                    .testimonials-section {
                        padding: 50px 0;
                    }
                }

                @media (max-width: 768px) {
                    .testimonials-section {
                        padding: 40px 0;
                    }

                    .testimonials-section .section-header h2 {
                        font-size: var(--font-2xl);
                    }

                    .rating-summary {
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 15px;
                        padding: 16px 24px;
                        border-radius: var(--radius-lg);
                    }

                    .rating-divider {
                        display: none;
                    }

                    .rating-number {
                        font-size: var(--font-lg);
                    }

                    .testimonial-card {
                        padding: 16px !important;
                    }
                }

                @media (max-width: 576px) {
                    .testimonials-section {
                        padding: 30px 0;
                    }

                    .testimonials-section .section-header h2 {
                        font-size: var(--font-xl);
                    }

                    .testimonial-avatar {
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                    }

                    .testimonial-name {
                        font-size: var(--font-sm);
                    }

                    .testimonial-location {
                        font-size: var(--font-xs);
                        max-width: 80px;
                    }

                    .testimonial-review {
                        font-size: var(--font-xs);
                        min-height: 40px;
                    }

                    .rating-summary {
                        padding: 12px 16px;
                        gap: 10px;
                    }

                    .rating-number {
                        font-size: var(--font-md);
                    }

                    .rating-label {
                        font-size: var(--font-xs);
                    }
                }
            `}</style>
        </>
    );
};

export default Testimonials;