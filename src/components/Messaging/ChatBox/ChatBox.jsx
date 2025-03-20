import React, { useEffect, useRef, useState } from "react";
import MessageCard from "../MessageCard/MessageCard";
import ChatInput from "../messaging-inputs/ChatInput";
import "./ChatBox.css";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../config/firebase";
import ChatHeader from "../ChatHeader/ChatHeader";
import { io } from "socket.io-client";

const ChatBox = ({
  chatId,
  currentChat,
  currentClientId,
  currentClientName,
  currentClientEmail,
  currentFreelancerEmail,
  onEscrowClick,
}) => {
  const [messages, setMessages] = useState([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState();
  const [fileIcon, setFileIcon] = useState();

  const [isTyping, setIsTyping] = useState({});
  const [text, setText] = useState("");
  const uid = localStorage.getItem("uid");
  const token = localStorage.getItem("token");
  const bottomRef = useRef();
  const socketRef = useRef();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const userRole = localStorage.getItem("role");
  const [projectStatus, setProjectStatus] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [escrowData, setEscrowData] = useState(null);
  const otherParticipant = currentChat?.participants?.find(
    (part) => part.uid !== uid
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesContainerRef = useRef(null);
  const MESSAGES_PER_PAGE = 20;
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      fetchProjectStatus();
    }
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:8000");

    // Join the chat room when component mounts
    if (chatId) {
      socketRef.current.emit("join-chat", chatId);
    }

    // Listen for new messages
    socketRef.current.on("new-message", (data) => {
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    // Listen for new project notifications
    socketRef.current.on("new-project", (data) => {
      if (data.chatId === chatId && userRole === "client") {
        setProjectData(data.projectData);
        setShowProjectModal(true);
      }
    });

    // Listen for typing status
    socketRef.current.on("user-typing", ({ userId, isTyping }) => {
      if (userId === otherParticipant?.uid) {
        setIsTyping(isTyping);
      }
    });

    // Cleanup on unmount
    return () => {
      if (chatId) {
        socketRef.current.emit("leave-chat", chatId);
      }
      socketRef.current.disconnect();
    };
  }, [chatId, userRole]);

  const fetchMessages = async (pageNum = 1, isInitial = true) => {
    try {
      setIsLoadingMore(true);
      const response = await fetch(
        `http://localhost:8000/api/chats/${chatId}?page=${pageNum}&limit=${MESSAGES_PER_PAGE}`,
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      const url = (data.chat?.participants?.filter(
        (part) => part.uid !== localStorage.getItem("uid")
      )[0]?.photoURL) || "";

      setPhotoUrl(url);
      
      // Update messages based on whether this is initial load or loading more
      if (isInitial) {
        setMessages(data.chat.messages);
      } else {
        setMessages(prev => [...data.chat.messages, ...prev]);
      }
      
      setHasMore(data.chat.messages.length === MESSAGES_PER_PAGE);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMore(false);
      setLoading(false);
    }
  };

  const fetchProjectStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/projects/chat/${chatId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      const data = await response.json();
      if (data.project) {
        setProjectStatus(data.project);
      }
    } catch (error) {
      console.error("Error fetching project status:", error);
    }
  };

  const sendMessage = async (text, files, fileIcon) => {
    try {
      let attachments = [];
      if (files) {
        attachments = await handleFileUpload(files || []);
      }

      const response = await fetch(
        `http://localhost:8000/api/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            senderId: uid,
            message: text || "",
            attachments: attachments || [],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // No need to fetch messages here as we'll receive the update via socket
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files.length) return [];
    setIsUploading(true);

    try {
      console.log("Starting file upload for chat:", chatId);
      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(
          storage,
          `chat-attachments/${chatId}/${Date.now()}-${file.name}`
        );
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return {
          name: file.name,
          type: file.type,
          url: url,
        };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading files:", error);
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleEscrowClick = () => {
    setShowEscrowModal(true);
  };

  const handleEscrowOpen = (data) => {
    setEscrowData(data);
    setShowEscrowModal(true);
  };

  const handleDeleteProject = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectStatus.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Unauthorized - Please log in again");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete project");
      }

      // Clear project status and close modal if open
      setProjectStatus(null);
      setShowProjectDetails(false);

      // Notify socket about project deletion
      socketRef.current.emit("project-deleted", {
        chatId,
        projectId: projectStatus.id,
      });
    } catch (error) {
      console.error("Error deleting project:", error.message);
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt?._seconds ? message.createdAt._seconds * 1000 : message.createdAt);
      const dateStr = date.toDateString();
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(message);
    });
    
    return groups;
  };

  if (loading) return;
  console.log({ otherParticipant, projectStatus });
  return (
    <div className="f-chat-box">
      {!currentChat ? (
        <div>No messages</div>
      ) : (
        <>
          <ChatHeader currentChat={currentChat} />
          {projectStatus &&
            (otherParticipant.uid === projectStatus.clientId ||
              otherParticipant.uid === projectStatus.freelancerId) && (
              <div className="project-status-container">
                <div className="project-status-header">
                  <h3>Project Status</h3>
                  <div className="project-status-actions">
                    <button
                      className="view-project-btn"
                      onClick={() => setShowProjectDetails(true)}
                    >
                      View Project
                    </button>
                    {userRole === "client" &&
                      projectStatus?.status === "pending" && (
                        <button
                          className="delete-project-btn"
                          onClick={handleDeleteProject}
                        >
                          Delete Project
                        </button>
                      )}
                    {/* {userRole === "freelancer" &&
                      projectStatus.status === "approved" && (
                        <button
                          className="create-escrow-btn"
                          onClick={handleEscrowClick}
                        >
                          Create Escrow
                        </button>
                      )} */}
                  </div>
                </div>

                <div className="project-status-details">
                  <div className="status-item">
                    <span className="status-label">Status:</span>
                    <span className={`status-value ${projectStatus.status}`}>
                      {projectStatus.status.charAt(0).toUpperCase() +
                        projectStatus.status.slice(1)}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Title:</span>
                    <span className="status-value">{projectStatus.title}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Budget:</span>
                    <span className="status-value">
                      R{projectStatus.budget}
                    </span>
                  </div>
                </div>
              </div>
            )}
          <div className="f-messages-container">
            {loading ? (
              <div className="loading">Loading messages...</div>
            ) : (
              <div className="f-messages-wrapper">
                {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                  <div key={date} className="message-date-group">
                    <div className="date-divider">
                      <span className="date-label">
                        {new Date(date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {dateMessages.map((msg, i) => (
                      <MessageCard key={i} message={msg} />
                    ))}
                  </div>
                ))}
                <div ref={bottomRef}></div>
              </div>
            )}
          </div>
          <div className="chat-input-container">
            <ChatInput
              files={files}
              setFiles={setFiles}
              fileIcon={fileIcon}
              setFileIcon={setFileIcon}
              text={text}
              setText={setText}
              sendMessage={sendMessage}
            />
          </div>

          {/* Project Details Modal */}
          {showProjectDetails &&
            projectStatus &&
            (otherParticipant.uid === projectStatus.clientId ||
              otherParticipant.uid === projectStatus.freelancerId) && (
              <ProjectDetails
                project={projectStatus}
                onClose={() => setShowProjectDetails(false)}
                isClient={userRole === "client"}
                onEscrowOpen={handleEscrowOpen}
              />
            )}

          {/* Existing Project Modal */}
          {showProjectModal && (
            <ProjectModal
              isOpen={showProjectModal}
              onClose={() => setShowProjectModal(false)}
              projectData={projectData}
              chatId={chatId}
              isClientView={userRole === "client"}
            />
          )}

          {showEscrowModal && (
            <div className="escrow-modal-overlay">
              <div className="escrow-modal">
                <div className="escrow-modal-header">
                  <h2>Update Escrow Agreement</h2>
                  <button
                    className="close-button"
                    onClick={() => setShowEscrowModal(false)}
                  >
                    ×
                  </button>
                </div>
                <EscrowForm
                  onSubmit={async (escrowData) => {
                    try {
                      // Handle escrow submission
                      await handleEscrowSubmit(escrowData);
                      setShowEscrowModal(false);
                    } catch (error) {
                      console.error("Error creating escrow:", error);
                    }
                  }}
                  freelancerId={escrowData.freelancerId}
                  clientId={escrowData.clientId}
                  existingEscrow={escrowData.escrowId}
                  project={escrowData.project}
                  isModal={true}
                  onClose={() => setShowEscrowModal(false)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatBox;
