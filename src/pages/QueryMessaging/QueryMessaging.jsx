import React, { useEffect, useState } from "react";
import "./QueryMessaging.css";
import Navbar from "../../components/common/NavBar/NavBar";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import PeopleComponent from "../../components/Messaging/PeopleComponent/PeopleComponent";
import ChatBox from "../../components/Messaging/ChatBox/ChatBox";
import io from "socket.io-client";
import ZoomMeetingModal from "../../components/Messaging/ZoomMeetingModal/ZoomMeetingModal";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../../config/backend-config";
import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import PersonCard from "../../components/Messaging/PersonCard/PersonCard";
import { BsPersonCircle } from "react-icons/bs";
import QueryChatBox from "../../components/Messaging/ChatBox/QueryChatBox";

const QueryMessaging = () => {
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [isInvitation, setIsInvitation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const [isReports, setIsReports] = useState(false);
  const [isUserChats, setIsUserChats] = useState(false);
  const [current, setCurrent] = useState("Chats");
  const [unsubscribe, setUnsubscribe] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null)
  const activeStatus = false;
  const unreadCount = 0;
  const isLoading = false;
  const navigate = useNavigate();
  const url = BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Get current user info from token
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    console.log("Token payload:", tokenPayload);

    // Extract user ID from the payload
    const userId = tokenPayload.uid;
    console.log("Setting current user ID:", userId);
    setCurrentUserId(userId);

    // Set user role from the payload
    const userRole = tokenPayload.roles?.[0] || tokenPayload.type;
    console.log("Setting user role:", userRole);
    setUserRole(userRole);

    console.log('checking for anonymous chats');
    initializeSocket();

    const unsubscribe = fetchAnonymousChats();
    return () => unsubscribe(); // cleanup
  }, [navigate]);

  useEffect(() => {
    if (currentChatId) {
      getCurrentChat();
    }
  }, [currentChatId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = chats.filter((chat) => {
        const otherParticipant = chat.participants?.find(
          (p) => p.id !== currentUserId
        );
        return (
          otherParticipant?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          otherParticipant?.email
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      });
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  useEffect(() => {
    const filteredChats =
      chats.length > 0 && current == "UserChats"
        ? chats.filter(
          (chat) => chat.tags && chat.tags.some((tag) => tag === "admin")
        )
        : current == "Reports"
          ? chats.filter(
            (chat) => chat.tags && chat.tags.some((tag) => tag === "report")
          )
          : chats.filter((chat) => chat.chatType === "admin-admin");
    setFilteredChats(filteredChats);

    console.log({ chats, filteredChats });
  }, [chats, current, currentChatId]);
  const initializeSocket = () => {
    const socket = io(url);

    socket.on("new-admin-message", (data) => {
      if (data.chatId === currentChatId) {
        getCurrentChat();
      }
      fetchChats();
    });

    socket.on("admin-chat-created", (data) => {
      fetchChats();
    });

    socket.on("chat-archived", (data) => {
      if (data.chatId === currentChatId) {
        setCurrentChatId("");
        setCurrentChat(null);
      }
      fetchChats();
    });

    socket.on("video-call-invitation", (data) => {
      if (data.recipientId === currentUserId) {
        handleVideoCallInvitation(data);
      }
    });

    return () => socket.disconnect();
  };
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
  const handleVideoCallInvitation = (data) => {
    if (Notification.permission === "granted") {
      const notification = new Notification("Video Call Invitation", {
        body: `${data.initiatorName} is inviting you to a video call`,
        icon: "/path/to/notification-icon.png",
      });

      notification.onclick = () => {
        window.focus();
        setMeetingDetails(data.meetingDetails);
        setIsInvitation(true);
        setShowZoomModal(true);
      };
    }

    setMeetingDetails(data.meetingDetails);
    setIsInvitation(true);
    setShowZoomModal(true);
  };

  const fetchAnonymousChats = () => {
    console.log("subscribing to achats");

    const roomsRef = collection(db, "achats");
    const qry = query(roomsRef);

    return onSnapshot(qry, (snapshot) => {
      const rooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log({ rooms });
      setChats(rooms);
    });
  };
  const handleEndChat = () => {
    const roomsRef = doc(db, "achats", currentRoom)
    updateDoc(roomsRef, { active: false })
  }
  const handleClick = (roomId) => {
    console.log("subscribing to messages for room:", roomId);

    // if already listening to another room, unsubscribe first
    if (unsubscribe) unsubscribe();

    const messagesRef = collection(db, "achats", roomId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    setCurrentRoom(roomId)
    const unsub = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSelectedMessages(messages);
    });

    setUnsubscribe(() => unsub);
  };
  const sendMessage = async (text) => {
    try {
      const roomRef = doc(db, "achats", currentRoom)
      await updateDoc(roomRef, {
        lastMessage: text,
        updatedAt: serverTimestamp()
      })
      const messagesRef = collection(db, "achats", currentRoom, "messages");
      await addDoc(messagesRef, {
        text: text,
        sender: "admin",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.log({ error });
      
    }

  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="QueryMessagingC">
      <Sidebar onToggle={setIsSidebarOpen} />
      <div
        className={`main-content ${isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
          }`}
      >
        <Navbar />

        <div className="messagePageContainer">
          <div className="chats-section">
            <div className="PeopleComponent">
              <div className="people-header">
                <div className="people-title">
                  {
                    "Queries"
                  }
                  {/* {showAdmins ? "Admin Users" : "Admin Chats"} */}
                </div>
              </div>
              <div className="people-list">
                {
                  chats && chats.length > 0 && chats.map(chat => {
                    return (
                      <div
                        className={`PersonCard ${activeStatus === 'active' ? 'active' : ''} ${unreadCount > 0 ? 'unread' : ''}`}
                        onClick={() => handleClick(chat.id)}
                      >
                        <div className="person-avatar">
                          <BsPersonCircle className="default-avatar" />
                          {activeStatus === 'active' && <span className="online-status"></span>}
                        </div>
                        <div className="person-info">
                          <div className="person-header">
                            <div className="person-name">{"Anonymous"}</div>
                            <div className="last-message-time">{chat.timestamp}</div>
                          </div>
                          <div className="last-message">
                            {"last message"}
                          </div>
                          {unreadCount > 0 && (
                            <div className="unread-badge">{unreadCount}</div>
                          )}
                        </div>
                      </div>
                    )
                  })
                }

              </div>
            </div>
          </div>
          <div className="chatbox-section">
            {currentRoom ? (
              <QueryChatBox
                handleEndChat={handleEndChat}
                messages={selectedMessages}
                sendMessage={sendMessage}
              />
            ) : (
              <div className="no-chat-selected">
                <h2>Select a chat to start messaging</h2>
              </div>
            )}
          </div>
        </div>
      </div>
      {showZoomModal && (
        <ZoomMeetingModal
          isOpen={showZoomModal}
          onClose={() => setShowZoomModal(false)}
          meetingDetails={meetingDetails}
          isInvitation={isInvitation}
        />
      )}
    </div>
  );
};

export default QueryMessaging;
