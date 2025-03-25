import React, { useEffect, useState } from "react";
import "./MessagingPage.css";
import Navbar from "../../components/common/NavBar/NavBar";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import PeopleComponent from "../../components/Messaging/PeopleComponent/PeopleComponent";
import ChatBox from "../../components/Messaging/ChatBox/ChatBox";
import io from "socket.io-client";
import ZoomMeetingModal from "../../components/Messaging/ZoomMeetingModal/ZoomMeetingModal";
import { useNavigate } from "react-router-dom";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Get current user info from token
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', tokenPayload);
    
    // Extract user ID from the payload
    const userId = tokenPayload.uid;
    console.log('Setting current user ID:', userId);
    setCurrentUserId(userId);
    
    // Set user role from the payload
    const userRole = tokenPayload.roles?.[0] || tokenPayload.type;
    console.log('Setting user role:', userRole);
    setUserRole(userRole);

    fetchChats();
    initializeSocket();
  }, [navigate]);

  useEffect(() => {
    if (currentChatId) {
      getCurrentChat();
    }
  }, [currentChatId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = chats.filter(chat => {
        const otherParticipant = chat.participants?.find(p => p.id !== currentUserId);
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
      fetchChats();
    });

    socket.on('admin-chat-created', (data) => {
      fetchChats();
    });

    socket.on('chat-archived', (data) => {
      if (data.chatId === currentChatId) {
        setCurrentChatId("");
        setCurrentChat(null);
      }
      fetchChats();
    });

    socket.on('video-call-invitation', (data) => {
      if (data.recipientId === currentUserId) {
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
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(
        `${url}/api/adminChats`,
        {
          method: "GET",
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/admin/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched chats data:', data.chats);
      console.log('Current user ID:', currentUserId);
      
      // Sort chats by last message timestamp
      const sortedChats = data.chats.sort((a, b) => {
        const timeA = a.updatedAt?._seconds ? a.updatedAt._seconds * 1000 : new Date(a.updatedAt).getTime();
        const timeB = b.updatedAt?._seconds ? b.updatedAt._seconds * 1000 : new Date(b.updatedAt).getTime();
        return timeB - timeA; // Most recent first
      });
      setChats(sortedChats);
      setFilteredChats(sortedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentChat = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(
        `${url}/api/adminChats/${currentChatId}/messages`,
        {
          method: "GET",
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/admin/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Current chat participants:', data.participants);
      
      // Ensure participants array is properly formatted
      const formattedParticipants = data.participants.map(participant => {
        if (typeof participant === 'string') {
          return participant;
        }
        return {
          id: participant.id,
          name: participant.name || participant.displayName,
          profilePicture: participant.profilePicture,
          activeStatus: participant.activeStatus,
          role: participant.role || 'admin' // Ensure role is set
        };
      });

      setCurrentChat({
        ...data,
        participants: formattedParticipants
      });
      
      // Set the other participant's info from participants array
      const otherParticipant = formattedParticipants.find(p => {
        const participantId = typeof p === 'object' ? p.id : p;
        return participantId !== currentUserId;
      });
      
      if (otherParticipant) {
        const otherUserName = typeof otherParticipant === 'object' 
          ? (otherParticipant.name || otherParticipant.displayName || "Unknown User")
          : "Unknown User";
        setCurrentUserName(otherUserName);
      }
    } catch (error) {
      console.error("Error fetching current chat:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleChatSelect = (chatId, selectedParticipant) => {
    console.log('Chat selected:', { chatId, selectedParticipant });
    setCurrentChatId(chatId);
    
    // Set the selected participant's name and role
    if (selectedParticipant) {
      const participantName = selectedParticipant.name || selectedParticipant.displayName || "Unknown User";
      console.log('Setting selected participant name to:', participantName);
      setCurrentUserName(participantName);
      
      // Update the chat in the chats list with the new participant info
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            // Create a properly structured chat object
            const updatedChat = {
              ...chat,
              selectedParticipant: {
                id: selectedParticipant.id,
                name: participantName,
                profilePicture: selectedParticipant.profilePicture,
                activeStatus: selectedParticipant.activeStatus
              },
              metadata: {
                target: {
                  id: selectedParticipant.id,
                  name: participantName,
                  profilePicture: selectedParticipant.profilePicture,
                  activeStatus: selectedParticipant.activeStatus
                },
                initiator: {
                  id: currentUserId,
                  name: currentUserName
                }
              }
            };
            console.log('Updated chat structure:', updatedChat);
            return updatedChat;
          }
          return chat;
        });
      });

      // Update currentChat with the properly structured data
      setCurrentChat(prevChat => {
        if (prevChat && prevChat.id === chatId) {
          return {
            ...prevChat,
            selectedParticipant: {
              id: selectedParticipant.id,
              name: participantName,
              profilePicture: selectedParticipant.profilePicture,
              activeStatus: selectedParticipant.activeStatus
            },
            metadata: {
              target: {
                id: selectedParticipant.id,
                name: participantName,
                profilePicture: selectedParticipant.profilePicture,
                activeStatus: selectedParticipant.activeStatus
              },
              initiator: {
                id: currentUserId,
                name: currentUserName
              }
            }
          };
        }
        return prevChat;
      });
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
        <SearchBar placeholder="Search chats..." onSearch={handleSearch} />

        <div className="messagePageContainer">
          <div className="chats-section">
            <PeopleComponent
              people={filteredChats}
              currentUserId={currentUserId}
              onChatSelect={handleChatSelect}
              isAdminChat={true}
              currentChatId={currentChatId}
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
                isInitiator={currentChat?.metadata?.initiator?.id === currentUserId}
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