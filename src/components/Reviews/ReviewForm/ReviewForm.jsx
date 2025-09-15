import React, { useState } from "react"; 
import "./ReviewForm.css";

const ReviewForm = ({ onClose, onSubmit }) => {
  const [rating, setRating] = useState(4);
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false); 

  const handleStarClick = (index) => {
    setRating(index + 1);
  };

  const handleSubmit = () => {
    if (onSubmit) {
      setIsLoading(true); 

      onSubmit(rating, review);

      setTimeout(() => {
        setIsLoading(false); 
        onClose(); 
      }, 2000);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="review-modal">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <img src="/images/close-btn.png" alt="Close" />
          </button>
        </div>

        <h3 className="modal-title">Review Form</h3>
        <div className="rate-text">
            <p>Rate the level using stars</p>
        </div>
        <div className="star-rating">
          {[...Array(5)].map((_, index) => (
            <img
              key={index}
              src="/images/star.png"
              alt="Star"
              className={`star-img ${index < rating ? "filled" : "unfilled"}`}
              onClick={() => handleStarClick(index)}
            />
          ))}
        </div>
        <textarea
          placeholder="Write your review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <button className="submit-btn" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <div className="loader"></div> 
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;
