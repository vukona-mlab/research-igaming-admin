import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatHeader.css";
import {
  BsThreeDotsVertical,
  BsPersonCircle,
  BsCameraVideo,
} from "react-icons/bs";
import { io } from "socket.io-client";
import ZoomMeetingModal from "../ZoomMeetingModal/ZoomMeetingModal";
import BACKEND_URL from "../../../config/backend-config";

const url = BACKEND_URL;
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
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);

  // Get user role and ID from localStorage
  const userRole = localStorage.getItem("role");
  const currentUserId = localStorage.getItem("uid");

  // Get selected participant from chat data
  const selectedParticipant = currentChat?.metadata?.target;
  // console.log("Current chat in ChatHeader:", currentChat);
  // console.log("Selected participant in ChatHeader:", selectedParticipant);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!selectedParticipant?.id) {
        console.log("No selected participant ID found");
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        // Format the token with Bearer prefix if not already present
        const authToken = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;

        // Try admin profile endpoint first
        let response = await fetch(
          `${url}/api/auth/admin/profile/${selectedParticipant.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );

        // If admin profile fails, try user profile endpoint
        if (!response.ok && response.status === 404) {
          response = await fetch(
            `${url}/api/auth/profile/${selectedParticipant.id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: authToken,
              },
            }
          );
        }

        if (!response.ok) {
          console.error("Failed to fetch user profile:", response.status);
          return;
        }

        const data = await response.json();
        const profile = data.profile || data.user;
        // console.log("Fetched user profile:", profile);

        // Update user profile with all available data
        const updatedProfile = {
          ...profile,
          name: profile.displayName || profile.name || selectedParticipant.name,
          profilePicture:
            profile.profilePicture || selectedParticipant.profilePicture,
          activeStatus:
            profile.activeStatus || selectedParticipant.activeStatus,
        };

        setUserProfile(updatedProfile);
        setProfilePicture(updatedProfile.profilePicture);
        setActiveStatus(updatedProfile.activeStatus || false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Fallback to selectedParticipant data if fetch fails
        if (selectedParticipant) {
          setUserProfile(selectedParticipant);
          setProfilePicture(selectedParticipant.profilePicture);
          setActiveStatus(selectedParticipant.activeStatus || false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [selectedParticipant?.id]);

  useEffect(() => {
    socketRef.current = io(url, { transports: ["websocket"] });

    socketRef.current.on("get-active-status", (data) => {
      if (selectedParticipant?.id === data.uid) {
        setActiveStatus(data.activeStatus);
      }
    });

    socketRef.current.on("chat-archived", (data) => {
      if (data.chatId === currentChat.id) {
        navigate("/admin/messages");
      }
    });

    return () => {
      socketRef.current.off("get-active-status");
      socketRef.current.off("chat-archived");
    };
  }, [selectedParticipant?.id, currentChat?.id, navigate]);

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
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(
        `${url}/api/adminChats/${currentChat.id}/archive`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Authentication failed");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Emit socket event for real-time update
      socket.emit("chat-archived", { chatId: currentChat.id });
      navigate("/admin/messages");
    } catch (error) {
      console.error("Error archiving chat:", error);
    }
    setShowMenu(false);
  };

  const handleDeleteChat = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(`${url}/api/adminChats/${currentChat.id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Authentication failed");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Emit socket event for real-time update
      socket.emit("chat-deleted", { chatId: currentChat.id });
      navigate("/admin/messages");
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
    setShowMenu(false);
  };

  const handleVideoCall = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const initiatorName = currentChat?.metadata?.initiator?.name || "Admin";

      // First create the Zoom meeting
      const meetingRequest = {
        topic: `Meeting with ${userProfile?.name || selectedParticipant?.name}`,
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
          meeting_authentication: false,
        },
      };

      const response = await fetch(`${url}/api/zoom/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(meetingRequest),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Authentication failed");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Send meeting details as a message in the chat
      const messageResponse = await fetch(
        `${url}/api/adminChats/${currentChat.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            message: `Video call initiated by ${initiatorName}`,
            type: "zoom-meeting",
            meetingDetails: {
              join_url: data.join_url,
              password: data.password,
              meeting_id: data.meeting_id,
              host_name: initiatorName,
              initiator_id: currentUserId,
            },
          }),
        }
      );

      if (!messageResponse.ok) {
        throw new Error("Failed to send meeting details message");
      }

      // Socket emission for real-time notification
      socket.emit("video-call-invitation", {
        chatId: currentChat.id,
        meetingDetails: {
          ...data,
          host_name: initiatorName,
        },
        initiatorName: initiatorName,
        recipientId: selectedParticipant?.id,
        initiatorRole: userRole,
        initiatorId: currentUserId,
      });

      setMeetingDetails({
        ...data,
        host_name: initiatorName,
      });
      setShowZoomModal(true);
    } catch (error) {
      console.error("Error in video call:", error);
      alert("Error creating video call. Please try again.");
    }
    setShowMenu(false);
  };

  return (
    <>
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="avatar-wrapper">
            {isLoading ? (
              <BsPersonCircle className="default-avatar" />
            ) : profilePicture ? (
              <img
                src={profilePicture}
                alt={userProfile?.name || "User"}
                className="user-avatar"
                onError={(e) => {
                  console.error("Error loading profile picture:", e);
                  e.target.src = ""; // Clear the src to show default avatar
                  setProfilePicture(null); // Clear the profile picture state
                }}
              />
            ) : (
              <BsPersonCircle className="default-avatar" />
            )}
            <span
              className={`online-status ${activeStatus ? "active" : ""}`}
            ></span>
          </div>
          <div className="user-info">
            <h3 className="user-name">
              {isLoading ? "Loading..." : userProfile?.name || "User"}
            </h3>
            <span className="user-status">
              {!activeStatus
                ? `Last seen ${(() => {
                    const lastSeen = userProfile?.lastSeen;
                    if (!lastSeen) return "Never";

                    // Handle Firestore timestamp
                    if (lastSeen._seconds) {
                      return new Date(
                        lastSeen._seconds * 1000
                      ).toLocaleString();
                    }

                    // Handle regular date string or timestamp
                    const date = new Date(lastSeen);
                    return isNaN(date.getTime())
                      ? "Never"
                      : date.toLocaleString();
                  })()}`
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
