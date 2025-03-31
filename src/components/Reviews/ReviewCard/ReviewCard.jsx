import React, { useState, useRef, useEffect } from 'react';
import './ReviewCard.css';
import StarIcon from '../../../assets/Star_duotone.svg';
import axios from 'axios';

const ReviewCard = ({ review, onStatusUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const contextMenuRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setShowContextMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp._seconds) {
            return 'Date unavailable';
        }
        const date = new Date(timestamp._seconds * 1000); 
        return date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short' 
        }).split(' ').reverse().join(' ');
    };

    const renderStars = () => {
        return [...Array(review.stars)].map((_, index) => (
            <img 
                key={index} 
                src={StarIcon} 
                alt="star"
                className="star"
            />
        ));
    };

    const handleContextMenuClick = (e) => {
        e.stopPropagation();
        setShowContextMenu(!showContextMenu);
    };

    const handleContextMenuAction = async (action) => {
        try {
            setIsUpdating(true);
            const token = localStorage.getItem('authToken'); // Get the token which already includes 'Bearer' prefix
            const status = action === 'approve' ? 'Approved' : 'Declined';

            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/reviews/status`,
                {
                    reviewId: review.id,
                    status
                },
                {
                    headers: {
                        'Authorization': token, // Use the token directly as it already includes 'Bearer'
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Call the parent component's callback to update the UI
            if (onStatusUpdate) {
                onStatusUpdate(review.id, status);
            }

            setShowContextMenu(false);
        } catch (error) {
            console.error('Error updating review status:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="review-card">
            <div className="review-header">
                <div className="left-content">
                    <img 
                        src={review.clientProfilePic || "https://via.placeholder.com/40"} 
                        alt={`${review.clientDisplayName}'s profile`} 
                        className="profile-image"
                    />
                    <span className="username">{review.clientDisplayName}</span>
                    <span className="dot-separator">•</span>
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                    {review.status === "Approved" && (
                        <span className="approval-badge">Approved</span>
                    )}
                    {review.status === "Declined" && (
                        <span className="decline-badge">Declined</span>
                    )}
                    {review.status === "Pending" && (
                        <span className="pending-badge">Pending</span>
                    )}
                </div>
                <div className="header-right">
                    <div className="star-rating">
                        {renderStars()}
                    </div>
                    <div className="context-menu-container" ref={contextMenuRef}>
                        <button 
                            className="context-menu-button"
                            onClick={handleContextMenuClick}
                            aria-label="More options"
                            disabled={isUpdating || review.status === "Approved"}
                        >
                            <span className="context-menu-dots">⋮</span>
                        </button>
                        {showContextMenu && (
                            <div className="context-menu">
                                <button 
                                    className="context-menu-item approve"
                                    onClick={() => handleContextMenuAction('approve')}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Updating...' : 'Approve'}
                                </button>
                                <button 
                                    className="context-menu-item decline"
                                    onClick={() => handleContextMenuAction('decline')}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Updating...' : 'Decline'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="review-content">
                <p className={`review-text ${isExpanded ? 'expanded' : ''}`}>
                    {review.message}
                </p>
                <button 
                    className="read-more-btn" 
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? 'Show Less' : 'Read More'}
                </button>
            </div>
        </div>
    );
};

export default ReviewCard;
