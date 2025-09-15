import React, { useState, useEffect } from "react";
import "./MessageCard.css";
import { Link } from 'react-router-dom';
import { BsCameraVideo, BsExclamationTriangle, BsInfoCircle } from 'react-icons/bs';
import { format } from "date-fns";

const MessageCard = ({ message, isCurrentUser }) => {
  const [isRead, setIsRead] = useState(false);
  const [isReadByAll, setIsReadByAll] = useState(false);

  useEffect(() => {
    // Update read status whenever message.readBy changes
    if (message.readBy && Array.isArray(message.readBy)) {
      console.log('Message read status update:', {
        messageId: message.id,
        readBy: message.readBy,
        senderId: message.senderId,
        isCurrentUser
      });

      // For messages from the current user
      if (isCurrentUser) {
        // Message is read if it has been read by the recipient
        setIsRead(message.readBy.length > 1);
        // Message is read by all if both sender and recipient have read it
        setIsReadByAll(message.readBy.length > 1);
      } else {
        // For messages from other users, they are considered read if the current user has read them
        setIsRead(message.readBy.includes(message.senderId));
        setIsReadByAll(message.readBy.length > 1);
      }
    }
  }, [message.readBy, message.senderId, isCurrentUser]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = timestamp?._seconds 
      ? new Date(timestamp._seconds * 1000)
      : new Date(timestamp);
    
    return format(date, "EEEE, d, h:mm a");
  };

  const getMessageClass = () => {
    if (message.type === 'system') {
      return 'system-message';
    }
    
    return isCurrentUser ? 'current-user-message' : 'other-user-message';
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
    if (message.type === 'system') {
      return (
        <div className="system-message-content">
          <span className="system-icon">ℹ️</span>
          <span>{message.text}</span>
        </div>
      );
    }

    if (message.attachments?.length > 0) {
      return (
        <div className="message-attachments">
          {message.attachments.map((attachment, index) => (
            <div key={index} className="attachment">
              {attachment.type.startsWith('image/') ? (
                <img src={attachment.url} alt={attachment.name} />
              ) : (
                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                  <div className="file-attachment">
                    <span className="file-icon">📎</span>
                    <span className="file-name">{attachment.name}</span>
                  </div>
                </a>
              )}
            </div>
          ))}
          {message.text && <div className="message-text">{message.text}</div>}
        </div>
      );
    }

    return <div className="message-text">{message.text}</div>;
  };

  return (
    <div className={`message-card ${getMessageClass()}`}>
      <div className="message-wrapper">
        <div className={`message-content ${isCurrentUser && isRead && isReadByAll ? 'read-by-all' : ''}`}>
          {renderMessageContent()}
        </div>
        <div className={`message-time ${isCurrentUser && isRead ? 'read' : ''}`}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
