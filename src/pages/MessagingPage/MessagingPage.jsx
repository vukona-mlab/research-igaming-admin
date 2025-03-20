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
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentChatId, setCurrentChatId] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [isInvitation, setIsInvitation] = useState(false);
  const token = localStorage.getItem("token");
  const url = import.meta.env.VITE_API_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    getRandomUsers();
    initializeSocket();
  }, []);

  useEffect(() => {
    if (currentChatId) {
      getCurrentChat();
    }
  }, [currentChatId]);

  const initializeSocket = () => {
    const socket = io(url);
    
    socket.on('new-admin-message', (data) => {
      if (data.chatId === currentChatId) {
        getCurrentChat();
      }
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

  const getRandomUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${url}/api/admin/users/random`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          setFilteredUsers(data.users);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentChat = async () => {
    try {
      const response = await fetch(
        `${url}/api/admin/chats/${currentChatId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentChat(data.chat);
        if (data.chat?.user) {
          setCurrentUserName(data.chat.user.name);
          setCurrentUserId(data.chat.user.uid);
        }
      }
    } catch (error) {
      console.error("Error fetching current chat:", error);
    }
  };

  const handleSearch = (query) => {
    if (!query) {
      setFilteredUsers(users);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      setFilteredUsers(
        users.filter((user) =>
          user.name.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="MessagingPageC">
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <Navbar />
        <div className="messagePageContainer">
          <SearchBar placeholder="Search users..." onSearch={handleSearch} />
          <PeopleComponent
            people={filteredUsers}
            setcurrentChatId={setCurrentChatId}
            setCurrentClientId={setCurrentUserId}
            setCurrentClientName={setCurrentUserName}
            isAdminChat={true}
          />
          {currentChatId && (
            <ChatBox
              chatId={currentChatId}
              currentChat={currentChat}
              currentClientId={currentUserId}
              currentClientName={currentUserName}
              isAdminChat={true}
            />
          )}
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