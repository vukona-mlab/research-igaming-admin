import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatHeader.css";
import { BsThreeDotsVertical, BsPersonCircle, BsCameraVideo } from "react-icons/bs";
import { io } from "socket.io-client";
import ZoomMeetingModal from '../ZoomMeetingModal/ZoomMeetingModal';

const url = import.meta.env.VITE_API_URL;
const socket = io(url, { transports: ["websocket"] });

const ChatHeader = ({ currentChat }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const socketRef = useRef();

  // Get user role and ID from localStorage
  const userRole = localStorage.getItem("role");
  const currentUserId = localStorage.getItem("uid");

  // Get other participant from chat metadata
  const otherParticipant = currentChat?.metadata?.target;

  useEffect(() => {
    if (otherParticipant && otherParticipant.activeStatus) {
      setActiveStatus(otherParticipant.activeStatus);
    }
  }, [otherParticipant]);

  useEffect(() => {
    socketRef.current = io(url, { transports: ["websocket"] });
    
    socketRef.current.on("get-active-status", (data) => {
      if (otherParticipant?.id === data.uid) {
        setActiveStatus(data.activeStatus);
      }
    });

    return () => {
      socketRef.current.off("get-active-status");
    };
  }, [otherParticipant]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEndChat = async () => {
    try {
      const response = await fetch(`${url}/api/adminChats/${currentChat.id}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': localStorage.getItem('token'),
        }
      });

      if (response.ok) {
        // Emit socket event for real-time update
        socket.emit('chat-archived', { chatId: currentChat.id });
        navigate('/admin/messages');
      }
    } catch (error) {
      console.error('Error archiving chat:', error);
    }
    setShowMenu(false);
  };

  const handleDeleteChat = async () => {
    try {
      const response = await fetch(`${url}/api/adminChats/${currentChat.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': localStorage.getItem('token'),
        }
      });

      if (response.ok) {
        // Emit socket event for real-time update
        socket.emit('chat-deleted', { chatId: currentChat.id });
        navigate('/admin/messages');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
    setShowMenu(false);
  };

  const handleVideoCall = async () => {
    try {
      const token = localStorage.getItem('token');
      const initiatorName = currentChat?.metadata?.initiator?.name || "Admin";

      // First create the Zoom meeting
      const meetingRequest = {
        topic: `Meeting with ${otherParticipant?.name}`,
        type: 2,
        start_time: new Date().toISOString(),
        duration: 60,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        agenda: `Video call initiated by ${initiatorName}`,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: false,
          waiting_room: false,
          meeting_authentication: false
        }
      };

      const response = await fetch(`${url}/api/zoom/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(meetingRequest)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Send meeting details as a message in the chat
        const messageResponse = await fetch(`${url}/api/adminChats/${currentChat.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          },
          body: JSON.stringify({
            message: `Video call initiated by ${initiatorName}`,
            type: 'zoom-meeting',
            meetingDetails: {
              join_url: data.join_url,
              password: data.password,
              meeting_id: data.meeting_id,
              host_name: initiatorName,
              initiator_id: currentUserId
            }
          })
        });

        if (!messageResponse.ok) {
          throw new Error('Failed to send meeting details message');
        }

        // Socket emission for real-time notification
        socket.emit('video-call-invitation', {
          chatId: currentChat.id,
          meetingDetails: {
            ...data,
            host_name: initiatorName
          },
          initiatorName: initiatorName,
          recipientId: otherParticipant?.id,
          initiatorRole: userRole,
          initiatorId: currentUserId
        });

        setMeetingDetails({
          ...data,
          host_name: initiatorName
        });
        setShowZoomModal(true);
      } else {
        throw new Error('Failed to create Zoom meeting');
      }
    } catch (error) {
      console.error('Error in video call:', error);
      alert('Error creating video call. Please try again.');
    }
    setShowMenu(false);
  };

  return (
    <>
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="avatar-wrapper">
            {otherParticipant?.photoURL ? (
              <img
                src={otherParticipant.photoURL}
                alt={otherParticipant?.name || "User"}
                className="user-avatar"
              />
            ) : (
              <BsPersonCircle className="default-avatar" />
            )}
            <span className={`online-status ${activeStatus ? 'active' : ''}`}></span>
          </div>
          <div className="user-info">
            <h3 className="user-name">{otherParticipant?.name || "User"}</h3>
            <span className="user-status">
              {!activeStatus
                ? `Last seen ${new Date(
                    otherParticipant?.lastSeen?._seconds 
                      ? otherParticipant.lastSeen._seconds * 1000 
                      : otherParticipant?.lastSeen
                  ).toLocaleString()}`
                : "Online"}
            </span>
          </div>
        </div>

        <div className="chat-header-right">
          <button className="video-call-button">
            <BsCameraVideo size={24} onClick={handleVideoCall} />
          </button>
          <button
            className="options-button"
            onClick={() => setShowMenu(!showMenu)}
            ref={buttonRef}
          >
            <BsThreeDotsVertical />
          </button>
          {showMenu && (
            <div className="context-menu" ref={menuRef}>
              <button onClick={handleEndChat}>Archive Chat</button>
              <button onClick={handleDeleteChat}>Delete Chat</button>
            </div>
          )}
        </div>
      </div>

      <ZoomMeetingModal 
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        meetingDetails={meetingDetails}
      />
    </>
  );
};

export default ChatHeader;
