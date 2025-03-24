import React from "react";
import "./MessageCard.css";
import { Link } from 'react-router-dom';
import { BsCameraVideo } from 'react-icons/bs';

const MessageCard = ({ message }) => {
  const isCurrentUser = message.senderId === localStorage.getItem('uid');
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    // Handle Firestore timestamp
    if (timestamp?._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else {
      // Handle regular Date object or ISO string
      date = new Date(timestamp);
    }

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Format time
    const timeString = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });

    // If message is from today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${timeString}`;
    }
    
    // If message is from yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeString}`;
    }
    
    // If message is from this year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      }) + ` at ${timeString}`;
    }
    
    // If message is from a different year
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ` at ${timeString}`;
  };

  const handleJoinMeeting = (url) => {
    window.open(url, '_blank', 'width=1000,height=600');
  };

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) {
      return null;
    }

    return message.attachments.map((attachment, index) => {
      if (attachment.type.includes("image")) {
        return (
          <div key={index} className="attachment-image">
            <img src={attachment.url} alt="attachment" />
          </div>
        );
      }
      
      if (attachment.type.includes("application") || attachment.type.includes("audio")) {
        return (
          <div key={index} className="attachment-file">
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              download={attachment.name}
            >
              {attachment.name}
            </a>
          </div>
        );
      }
      
      return null;
    });
  };

  const renderMessageContent = () => {
    if (message.type === 'zoom-meeting') {
      const isHost = message.meetingDetails.initiator_id === localStorage.getItem('uid');
      
      return (
        <div className="zoom-meeting-message">
          <div className="zoom-meeting-header">
            <BsCameraVideo size={20} />
            <span>Video Call Invitation</span>
          </div>
          <div className="zoom-meeting-details">
            <p className="host-info">
              Host: {message.meetingDetails.host_name} {isHost && '(You)'}
            </p>
            <p>Meeting ID: {message.meetingDetails.meeting_id}</p>
            <p>Password: {message.meetingDetails.password}</p>
            <button 
              className="join-meeting-btn"
              onClick={() => handleJoinMeeting(message.meetingDetails.join_url)}
            >
              Join Meeting
            </button>
          </div>
        </div>
      );
    }
    return message.text || message.message;
  };

  return (
    <div
      className={`MessageCard ${isCurrentUser ? "right" : "left"} ${
        message.type === 'project_creation' ? 'project-message' : ''
      }`}
    >
      <div className="message-wrapper">
        <div className="message-bubble">
          <div className="message-content">
            {renderMessageContent()}
          </div>
          <div className="attachments-container">
            {renderAttachments()}
          </div>
        </div>
        <div className="message-time">
          {formatTimestamp(message.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
