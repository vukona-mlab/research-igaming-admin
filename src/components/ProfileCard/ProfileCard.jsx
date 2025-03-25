import React from 'react';
import './ProfileCard.css';
import userIcon from '../../assets/user-icon.svg';
import emailIcon from '../../assets/email-icon.svg';
import phoneIcon from '../../assets/phone-icon.svg';
import calendarIcon from '../../assets/calendar-icon.svg';
import interestsIcon from '../../assets/interests-icon.svg';

const ProfileCard = ({ 
  fullName, 
  roles, 
  email, 
  phone, 
  dateOfBirth, 
  interests, 
  projectCount, 
  profileImage,
  onClose 
}) => {
  return (
    <div className="profile-card-overlay" >
      <div className="profile-card-container">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-left">
              <div className="profile-info">
                <div className="profile-image-container">
                  <img src={profileImage} alt={fullName} className="profile-image" />
                </div>
                <div className="profile-title">
                  <h2>{fullName}</h2>
                  <p className="role">{Array.isArray(roles) ? roles.join(', ') : roles}</p>
                </div>
              </div>
            </div>
            <div className="profile-stats">
              <div className="projects-count">
              <h3>Projects</h3>
                <div className="number">{projectCount}</div>
              </div>
              <button className="actions-button">Actions</button>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <div className="detail-left">
                <img src={userIcon} alt="" className="icon" />
                <span>Full Names</span>
              </div>
              <div className="detail-right">{fullName}</div>
            </div>
            <div className="detail-row">
              <div className="detail-left">
                <img src={emailIcon} alt="" className="icon" />
                <span>Email</span>
              </div>
              <div className="detail-right">{email}</div>
            </div>
            <div className="detail-row">
              <div className="detail-left">
                <img src={phoneIcon} alt="" className="icon" />
                <span>Phone</span>
              </div>
              <div className="detail-right">{phone}</div>
            </div>
            <div className="detail-row">
              <div className="detail-left">
                <img src={calendarIcon} alt="" className="icon" />
                <span>Date of birth</span>
              </div>
              <div className="detail-right">{dateOfBirth}</div>
            </div>
            <div className="detail-row">
              <div className="detail-left">
                <img src={interestsIcon} alt="" className="icon" />
                <span>Interests</span>
              </div>
              <div className="detail-right">{interests}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
