import React, { useEffect, useRef, useState } from "react";
import "./PersonCard.css";
import { BsPersonCircle } from "react-icons/bs";
import io from "socket.io-client";

const PersonCard = ({
  chatId,
  otherId,
  name,
  lastMessage,
  timestamp,
  photoUrl,
  formattedTime,
  isAdminChat,
  chatType,
  status,
  priority,
  category,
  unreadCount,
  onChatSelect,
  onProfileLoad
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const [profilePicture, setProfilePicture] = useState(photoUrl);
  const [displayName, setDisplayName] = useState(name);
  const [activeStatus, setActiveStatus] = useState(status);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL);

    socketRef.current.on("user-typing", ({ userId, isTyping }) => {
      if (userId === otherId) {
        setIsTyping(isTyping);
      }
    });

    socketRef.current.on("get-active-status", (data) => {
      if (otherId === data.uid) {
        setActiveStatus(data.activeStatus);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [otherId]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!otherId) return;
      
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        // Format the token with Bearer prefix if not already present
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        // Try admin profile endpoint first
        let response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/admin/profile/${otherId}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": authToken,
            },
          }
        );

        // If admin profile fails, try user profile endpoint
        if (!response.ok && response.status === 404) {
          response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/profile/${otherId}`,
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": authToken,
              },
            }
          );
        }

        if (!response.ok) {
          if (response.status === 403) {
            console.error('Access forbidden - insufficient permissions');
            return;
          }
          console.error('Failed to fetch user profile:', response.status);
          return;
        }

        const data = await response.json();
        const profile = data.profile || data.user;
        
        if (profile) {
          // Update the profile picture if available
          if (profile.profilePicture) {
            setProfilePicture(profile.profilePicture);
          }
          
          // Update display name
          setDisplayName(profile.displayName || profile.name || name);
          
          // Update active status
          setActiveStatus(profile.activeStatus);
          
          // Call onProfileLoad with the full profile data only if it's different from current data
          if (onProfileLoad && (
            profile.displayName !== displayName ||
            profile.profilePicture !== profilePicture ||
            profile.activeStatus !== activeStatus
          )) {
            onProfileLoad(profile);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [otherId]);

  const handleClick = () => {
    if (onChatSelect) {
      onChatSelect(chatId, { 
        id: otherId, 
        name: displayName,
        profilePicture: profilePicture,
        activeStatus: activeStatus
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp * 1000);
    const now = new Date();
    
    // If the message is from today, show only time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the message is from this week, show day name
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`PersonCard ${activeStatus === 'active' ? 'active' : ''} ${unreadCount > 0 ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <div className="person-avatar">
        {profilePicture ? (
          <img src={profilePicture} alt={displayName} />
        ) : (
          <BsPersonCircle className="default-avatar" />
        )}
        {activeStatus === 'active' && <span className="online-status"></span>}
      </div>
      <div className="person-info">
        <div className="person-header">
          <div className="person-name">{isLoading ? "Loading..." : displayName}</div>
          <div className="last-message-time">{formattedTime}</div>
        </div>
        <div className="last-message">
          {isTyping ? "Typing..." : lastMessage}
        </div>
        {unreadCount > 0 && (
          <div className="unread-badge">{unreadCount}</div>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
