import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';

const ReviewCard = ({ name, status, date, rating, text, profilePic }) => {
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        className={`h-5 w-5 ${index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <img 
            src={profilePic || "/default-avatar.jpg"} 
            alt={name} 
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="font-semibold mr-2">{name}</span>
          <span className={`px-2 py-1 rounded text-xs ${
            status === 'Approved' ? 'bg-green-100 text-green-800' : 
            status === 'Rejected' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        </div>
        <span className="text-gray-500 text-sm">
          {new Date(date).toLocaleDateString()}
        </span>
      </div>
      <div className="flex mb-2">{renderStars()}</div>
      <p className="text-gray-700">{text}</p>
    </div>
  );
};

const Reviews = ({ freelancerId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(null);

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
        const response = await axios.get('http://localhost:8000/api/reviews', {
          params: { 
            freelancerId: freelancerId,
            ...(filter && { stars: filter }) 
          },
          headers: {
            'Authorization': authToken
          }
        });
        
        // Include both 'Approved' and 'Pending' reviews
        const filteredReviews = (response.data.reviews || []).filter(
          review => ['Approved', 'Pending'].includes(review.status)
        );

        setReviews(filteredReviews);
        setLoading(false);
      } catch (err) {
        console.error('Review fetching error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch reviews');
        setLoading(false);
      }
    };

    // Only fetch reviews if freelancerId is provided
    if (freelancerId) {
      fetchReviews();
    } else {
      setError('No freelancer ID provided');
      setLoading(false);
    }
  }, [freelancerId, filter]);

  const starFilters = [1, 2, 3, 4, 5];

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
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      
      {/* Star Filter */}
      <div className="flex items-center mb-4">
        <span className="mr-2">Filter by:</span>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter(null)}
            className={`px-2 py-1 rounded ${filter === null ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          {starFilters.map(stars => (
            <button 
              key={stars}
              onClick={() => setFilter(stars)}
              className={`flex items-center px-2 py-1 rounded ${filter === stars ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {stars} <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center">No reviews yet</p>
      ) : (
        reviews.map((review, index) => (
          <ReviewCard 
            key={review.id || index}
            name={review.clientDisplayName || 'Anonymous'}
            status={review.status}
            date={review.createdAt?._seconds 
              ? new Date(review.createdAt._seconds * 1000) 
              : (review.createdAt || new Date())}
            rating={review.stars}
            text={review.message}
            profilePic={review.clientProfilePic}
          />
        ))
      )}
    </div>
  );
};

export default Reviews;