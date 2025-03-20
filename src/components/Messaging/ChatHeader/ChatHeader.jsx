import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatHeader.css";
import { BsThreeDotsVertical, BsPersonCircle, BsCameraVideo } from "react-icons/bs";
import { io } from "socket.io-client";
import ProjectModal from "../ProjectModal/ProjectModal";
import ZoomMeetingModal from '../ZoomMeetingModal/ZoomMeetingModal';

const url = "http://localhost:8000";
const socket = io(url, { transports: ["websocket"] });

const ChatHeader = ({ currentChat }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const socketRef = useRef();

  // Get user role and ID from localStorage
  const userRole = localStorage.getItem("role");
  const currentUserId = localStorage.getItem("uid");
  const isFreelancer = userRole === "freelancer";

  // Find the current user and other participant
  const currentUser = currentChat?.participants?.find(
    (part) => part.uid === currentUserId
  );

  const otherParticipant = currentChat?.participants?.find(
    (part) => part.uid !== currentUserId
  );
  useEffect(() => {
    if (otherParticipant && otherParticipant.activeStatus) {
      setActiveStatus(otherParticipant.activeStatus);
    }
  }, [otherParticipant]);
  useEffect(() => {
    socketRef.current = io(url, { transports: ["websocket"] });
    
    socketRef.current.on("get-active-status", (data) => {
      if (otherParticipant?.uid === data.uid) {
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

  const handleCreateProject = () => {
    setShowProjectModal(true);
    setShowMenu(false);
  };

  const handleEndChat = () => {
    // TODO: Implement end chat logic
    setShowMenu(false);
  };

  const handleDeleteChat = () => {
    // TODO: Implement delete chat logic
    setShowMenu(false);
  };
  const handleVideoCall = async () => {
    try {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      const currentUserId = localStorage.getItem('uid');
      const initiatorName = currentUser?.name || "User"; // Get the current user's name

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
        const messageResponse = await fetch(`${url}/api/chats/${currentChat.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          },
          body: JSON.stringify({
            message: `Video call initiated by ${initiatorName}`,
            senderId: currentUserId,
            type: 'zoom-meeting',
            meetingDetails: {
              join_url: data.join_url,
              password: data.password,
              meeting_id: data.meeting_id,
              host_name: initiatorName, // Set the host name as the initiator
              initiator_id: currentUserId // Store the initiator's ID
            }
          })
        });

        if (!messageResponse.ok) {
          throw new Error('Failed to send meeting details message');
        }

        // Socket emission for real-time notification
        socket.emit('video-call-invitation', {
          chatId: currentChat?.id,
          meetingDetails: {
            ...data,
            host_name: initiatorName // Include host name in socket emission
          },
          initiatorName: initiatorName,
          recipientId: otherParticipant?.uid,
          initiatorRole: userRole,
          initiatorId: currentUserId
        });

        setMeetingDetails({
          ...data,
          host_name: initiatorName // Include host name in modal data
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
            <span className="online-status"></span>
          </div>
          <div className="user-info">
            <h3 className="user-name">{otherParticipant?.name || "User"}</h3>
            <span className="user-status">
              {!activeStatus
                ? `Last seen ${new Date(
                    otherParticipant.lastSeen._seconds ||
                      otherParticipant.lastSeen
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
              {isFreelancer && (
                <button onClick={handleCreateProject}>
                  Create Project Agreement
                </button>
              )}
              <button onClick={handleEndChat}>End Chat</button>
              <button onClick={handleDeleteChat}>Delete Chat</button>
            </div>
          )}
        </div>
      </div>

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        chatId={currentChat?.id}
        isClientView={!isFreelancer}
        projectData={{
          clientId: isFreelancer ? otherParticipant?.uid : currentUserId,
          freelancerId: isFreelancer ? currentUserId : otherParticipant?.uid,
          clientEmail: isFreelancer
            ? otherParticipant?.email
            : currentUser?.email,
          freelancerEmail: isFreelancer
            ? currentUser?.email
            : otherParticipant?.email,
        }}
      />
      <ZoomMeetingModal 
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        meetingDetails={meetingDetails}
      />
    </>
  );
};

export default ChatHeader;
