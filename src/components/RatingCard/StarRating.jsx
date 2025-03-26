import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';

const StarRating = ({ 
  initialRating = 0, 
  clientId, 
  freelancerId, 
  onRatingSubmit,
  maxRating = 5, 
  starColor = '#FFD700', 
  size = 24, 
  interactive = false 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = async (selectedRating) => {
    if (!interactive) return;

    setIsSubmitting(true);
    try {
      // Prepare review data based on backend controller
      const reviewData = {
        clientId,
        freelancerId,
        stars: selectedRating,
        message: '' // You might want to add a message input
      };

      // Submit review to backend
      const response = await axios.post('/api/reviews', reviewData);
      
      // Update local state
      setRating(selectedRating);
      
      // Optional callback for parent component
      if (onRatingSubmit) {
        onRatingSubmit(response.data.review);
      }
    } catch (error) {
      console.error('Failed to submit rating', error);
      // Optionally handle error (show toast, reset rating, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          return (
            <FaStar
              key={index}
              color={starValue <= rating ? starColor : '#e4e5e9'}
              size={size}
              className={`mr-1 ${
                interactive ? 'cursor-pointer hover:opacity-70' : ''
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isSubmitting && handleStarClick(starValue)}
            />
          );
        })}
      </div>
      {interactive && (
        <span className="ml-2 text-sm text-gray-600">
          {isSubmitting ? 'Submitting...' : `${rating}/${maxRating}`}
        </span>
      )}
    </div>
  );
};

export default StarRating;