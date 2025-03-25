import React, { useEffect, useState } from "react";
import "./MessagingPage.css";
import Navbar from "../../components/common/NavBar/NavBar";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import PeopleComponent from "../../components/Messaging/PeopleComponent/PeopleComponent";
import ChatBox from "../../components/Messaging/ChatBox/ChatBox";
import io from "socket.io-client";
import ZoomMeetingModal from "../../components/Messaging/ZoomMeetingModal/ZoomMeetingModal"

const MessagingPage = () => {
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
  const token = localStorage.getItem("authToken");
  const url = import.meta.env.VITE_API_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    fetchChats();
    initializeSocket();
  }, []);

  useEffect(() => {
    if (currentChatId) {
      getCurrentChat();
    }
  }, [currentChatId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = chats.filter(chat => {
        const otherParticipant = chat.metadata?.target;
        return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               otherParticipant?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  const initializeSocket = () => {
    const socket = io(url);
    
    socket.on('new-admin-message', (data) => {
      if (data.chatId === currentChatId) {
        getCurrentChat();
      }
      // Update chat list
      fetchChats();
    });

    socket.on('video-call-invitation', (data) => {
      if (data.recipientId === localStorage.getItem('uid')) {
        handleVideoCallInvitation(data);
      }
    });

    return () => socket.disconnect();
  };

  const handleVideoCallInvitation = (data) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Video Call Invitation', {
        body: `${data.initiatorName} is inviting you to a video call`,
        icon: '/path/to/notification-icon.png'
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

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${url}/api/adminChats`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats);
        setFilteredChats(data.chats);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentChat = async () => {
    try {
      const response = await fetch(
        `${url}/api/adminChats/${currentChatId}/messages`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentChat(data);
        if (data.metadata?.target) {
          setCurrentUserName(data.metadata.target.name);
          setCurrentUserId(data.metadata.target.id);
        }
      }
    } catch (error) {
      console.error("Error fetching current chat:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="MessagingPageC">
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <Navbar />
        <SearchBar placeholder="Search chats..." onSearch={handleSearch} />
        <div className="messagePageContainer">
          <div className="chats-section">
            <PeopleComponent
              people={filteredChats}
              setcurrentChatId={setCurrentChatId}
              setCurrentClientId={setCurrentUserId}
              setCurrentClientName={setCurrentUserName}
              isAdminChat={true}
            />
          </div>
          <div className="chatbox-section">
            {currentChatId ? (
              <ChatBox
                chatId={currentChatId}
                currentChat={currentChat}
                currentClientId={currentUserId}
                currentClientName={currentUserName}
                isAdminChat={true}
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

export default MessagingPage;