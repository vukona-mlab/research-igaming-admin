import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import ReviewCard from '../../components/Reviews/ReviewCard/ReviewCard';
import FilterButtons from '../../components/FilterButtons/FilterButtons';
import BACKEND_URL from '../../config/backend-config';

// Memoized Filter Section
const FilterSection = memo(({ selectedFilter, onFilterChange }) => (
  <div className="mb-4">
    <FilterButtons 
      selectedFilter={selectedFilter}
      onFilterChange={onFilterChange}
    />
  </div>
));

// Memoized Reviews List
const ReviewsList = memo(({ reviews, onStatusUpdate }) => (
  <div>
    {reviews.length === 0 ? (
      <p className="text-gray-500 text-center">No reviews yet</p>
    ) : (
      reviews.map((review, index) => (
        <ReviewCard 
          key={review.id || index}
          review={review}
          onStatusUpdate={onStatusUpdate}
        />
      ))
    )}
  </div>
));

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const handleStatusUpdate = (reviewId, newStatus) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId 
          ? { ...review, status: newStatus }
          : review
      )
    );
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Retrieve the authentication token from local storage
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        // If no token is found, throw an error
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        // Ensure token starts with 'Bearer ' for API compatibility
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        // Use the base URL from the project's fetch calls
        const response = await axios.get(`${BACKEND_URL}/api/reviews`, {
          headers: {
            'Authorization': authToken
          }
        });
        
        // Filter reviews based on selected status
        const filteredReviews = (response.data.reviews || []).filter(review => {
          if (selectedFilter === "All") return true;
          return review.status === selectedFilter;
        });

        setReviews(filteredReviews);
        setLoading(false);
      } catch (err) {
        console.error('Review fetching error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch reviews');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [selectedFilter]);

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="max-w-2xl mx-auto p-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="w-5 h-5 bg-gray-200 rounded-full mr-1"></div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Error Component
  const ErrorComponent = () => (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        {error === 'No authentication token found. Please log in.' && (
          <p className="mt-2 text-sm text-red-600">Please log in to view reviews.</p>
        )}
      </div>
    </div>
  );

  // Render loading state
  if (loading) return <LoadingSkeleton />;

  // Render error state
  if (error) return <ErrorComponent />;

  return (
    <div className="max-w-2xl mx-auto pt-2 px-4">      
      <FilterSection 
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />
      <ReviewsList 
        reviews={reviews} 
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default Reviews;