import React, { useState, useEffect, useRef } from "react";
import "./PeopleComponent.css";
import PersonCard from "../PersonCard/PersonCard";
import { BsChatDots, BsPeople, BsChatSquareDots } from "react-icons/bs";
import { TbMessageReport } from "react-icons/tb";

const PeopleComponent = ({
  people,
  currentUserId,
  onChatSelect,
  isAdminChat,
  currentChatId,
  isReports,
  isUserChats,
  current,
  setCurrent,
}) => {
  const [showAdmins, setShowAdmins] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

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
      hour: "2-digit",
      minute: "2-digit",
    });

    // If message is from today
    if (date.toDateString() === now.toDateString()) {
      return timeString;
    }

    // If message is from yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // If message is from this week
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    // If message is from this year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }

    // If message is from a different year
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchUserProfile = async (uid) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        return null;
      }

      // Try admin profile endpoint first
      let response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/admin/profile/${uid}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
          },
        }
      );

      // If admin profile fails, try user profile endpoint
      if (!response.ok && response.status === 404) {
        response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/profile/${uid}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`,
            },
          }
        );
      }

      if (!response.ok) {
        console.error("Failed to fetch user profile");
        return null;
      }

      const data = await response.json();
      return data.profile || data.user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const getUserProfile = async (uid) => {
    if (userProfiles[uid]) {
      return userProfiles[uid];
    }

    const profile = await fetchUserProfile(uid);
    if (profile) {
      setUserProfiles((prev) => ({
        ...prev,
        [uid]: profile,
      }));
    }
    return profile;
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const cleanToken = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/admin/all`,
        {
          headers: {
            Authorization: cleanToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Authentication failed");
          return;
        }
        if (response.status === 404) {
          console.error("Admin endpoint not found. Please check the API URL.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Filter out the current user from the admin list
      const filteredAdmins = data.admins.filter(
        (admin) => admin.id !== currentUserId
      );
      setAdminUsers(filteredAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAdmins) {
      fetchAdmins();
    }
  }, [showAdmins, currentUserId]);

  const handleCreateChat = async (adminId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Fetch admin profile first
      const adminProfile = await getUserProfile(adminId);
      if (!adminProfile) {
        console.error("Failed to fetch admin profile");
        return;
      }

      console.log("Admin profile data:", adminProfile); // Debug log

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin-chats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            targetId: adminId,
            chatType: "admin-admin",
            initialMessage: "Chat initiated",
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Authentication failed");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const participantData = {
        id: adminId,
        name: adminProfile.displayName || adminProfile.name || "Admin",
        profilePicture: adminProfile.profilePicture,
        activeStatus: adminProfile.activeStatus,
      };
      console.log("Participant data being passed:", participantData); // Debug log
      onChatSelect(data.chatId, participantData);
      setShowAdmins(false);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  // Add a ref to track the current chat ID
  const currentChatIdRef = useRef(currentChatId);

  // Update the ref when currentChatId changes
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  return (
    <div className="PeopleComponent">
      <div className="people-header">
        <div className="people-title">
          {current == "Reports"
            ? "Reports"
            : current == "UserChats"
            ? "User Chats"
            : current == "AdminUsers"
            ? "Admin Users"
            : "Admin Chats"}
          {/* {showAdmins ? "Admin Users" : "Admin Chats"} */}
        </div>

        <button
          className="toggle-view-btn"
          onClick={() => {
            setCurrent("Reports");
            if (showAdmins) setShowAdmins(false);
          }}
        >
          <TbMessageReport />
        </button>

        <button
          className="toggle-view-btn"
          onClick={() => {
            setCurrent("UserChats");
            if (showAdmins) setShowAdmins(false);
          }}
        >
          <BsChatSquareDots />
        </button>
        <button
          className="toggle-view-btn"
          onClick={() => {
            setCurrent(!showAdmins ? "AdminUsers" : "AdminChats");

            setShowAdmins(!showAdmins);
          }}
        >
          {showAdmins ? <BsChatDots /> : <BsPeople />}
        </button>
      </div>

      <div className="people-list">
        {showAdmins ? (
          loading ? (
            <div className="loading">Loading admins...</div>
          ) : (
            adminUsers.map((admin) => (
              <div
                key={admin.id}
                className="person-card-container"
                onClick={() => handleCreateChat(admin.id)}
              >
                <PersonCard
                  chatId={admin.id}
                  otherId={admin.id}
                  name={admin.displayName || admin.email}
                  lastMessage="Click to start chat"
                  timestamp={admin.lastSeen}
                  photoUrl={admin.profilePicture || ""}
                  formattedTime={formatLastMessageTime(admin.lastSeen)}
                  isAdminChat={true}
                  chatType="admin-admin"
                  status={admin.activeStatus ? "active" : "inactive"}
                  priority="normal"
                  category="admin"
                />
              </div>
            ))
          )
        ) : people.length === 0 ? (
          <div className="no-chats">No chats</div>
        ) : (
          people
            .filter((chat) => {
              // Check if current user is a participant in the chat
              if (chat.participants && Array.isArray(chat.participants)) {
                return chat.participants.includes(currentUserId);
              }
              return false;
            })
            .map((chat) => {
              // Get participant from otherParticipant field first
              let participant = chat.otherParticipant;

              // If not found in otherParticipant, try metadata
              if (!participant) {
                participant = chat.metadata?.target || chat.metadata?.initiator;
              }

              // If still not found, try participants array
              if (
                !participant &&
                chat.participants &&
                Array.isArray(chat.participants)
              ) {
                // Find the participant that is not the current user
                const otherParticipantId = chat.participants.find((p) => {
                  const pId = typeof p === "object" ? p.uid || p.id : p;
                  return pId !== currentUserId;
                });

                if (otherParticipantId) {
                  participant = {
                    id:
                      typeof otherParticipantId === "object"
                        ? otherParticipantId.uid || otherParticipantId.id
                        : otherParticipantId,
                    name:
                      typeof otherParticipantId === "object"
                        ? otherParticipantId.displayName ||
                          otherParticipantId.name
                        : "Loading...",
                    profilePicture:
                      typeof otherParticipantId === "object"
                        ? otherParticipantId.profilePicture
                        : null,
                  };
                }
              }

              // Skip if no participant found or if it's the current user
              if (!participant || participant.id === currentUserId) {
                console.log("Skipping chat - no valid participant found", {
                  chatId: chat.id,
                  participants: chat.participants,
                  currentUserId,
                  otherParticipant: chat.otherParticipant,
                  metadata: chat.metadata,
                });
                return null;
              }

              // Get the last message from the chat
              const lastMessage =
                chat.lastMessage ||
                (chat.messages && chat.messages.length > 0
                  ? chat.messages[chat.messages.length - 1].message
                  : "No messages yet");

              return (
                <div
                  key={chat.id}
                  className="person-card-container"
                  onClick={() => {
                    console.log("Chat selected with participant:", participant); // Debug log
                    onChatSelect(chat.id, participant);
                  }}
                >
                  <PersonCard
                    chatId={chat.id}
                    otherId={participant.id}
                    name={participant.name || "Loading..."}
                    lastMessage={lastMessage}
                    timestamp={chat.updatedAt}
                    photoUrl={participant.profilePicture || ""}
                    formattedTime={formatLastMessageTime(chat.updatedAt)}
                    isAdminChat={isAdminChat}
                    chatType={chat.chatType}
                    status={participant.activeStatus ? "active" : "inactive"}
                    priority={chat.priority || "normal"}
                    category={chat.category || "user"}
                    unreadCount={chat.unreadCount?.[currentUserId] || 0}
                    onProfileLoad={async (profile) => {
                      if (profile && chat.id !== currentChatIdRef.current) {
                        console.log("Profile loaded in PersonCard:", profile); // Debug log
                        const updatedParticipant = {
                          id: participant.id,
                          name:
                            profile.displayName ||
                            profile.name ||
                            "Unknown User",
                          profilePicture: profile.profilePicture,
                          activeStatus: profile.activeStatus,
                        };
                        console.log(
                          "Updated participant data:",
                          updatedParticipant
                        ); // Debug log
                        chat.otherParticipant = updatedParticipant;
                        onChatSelect(chat.id, updatedParticipant);
                      }
                    }}
                  />
                </div>
              );
            })
            .filter(Boolean)
        )}
      </div>
    </div>
  );
};

export default PeopleComponent;
