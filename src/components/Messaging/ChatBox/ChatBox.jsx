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
  isAdminChat,
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
  const bottomRef = useRef();
  const socketRef = useRef();
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const userRole = localStorage.getItem("role");
  const messagesContainerRef = useRef(null);
  const MESSAGES_PER_PAGE = 20;
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      console.log("Fetching messages for chatId:", chatId);
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_API_URL);

    // Join the chat room when component mounts
    if (chatId) {
      socketRef.current.emit("join-chat", chatId);
    }

    // Listen for new messages
    socketRef.current.on("new-admin-message", (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    // Listen for typing status
    socketRef.current.on("user-typing", ({ userId, isTyping }) => {
      if (userId === currentClientId) {
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
  }, [chatId, currentClientId]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("Current token:", token);
  }, []);

  const fetchMessages = async (pageNum = 1, isInitial = true) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/adminChats/${chatId}/messages?page=${pageNum}&limit=${MESSAGES_PER_PAGE}`,
        {
          headers: {
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", response.status, errorText);
        throw new Error(`Failed to fetch messages: ${errorText}`);
      }

      const data = await response.json();
      
      // Sort messages by timestamp in ascending order (oldest first)
      const sortedMessages = (data.messages || []).sort((a, b) => {
        const timeA = a.createdAt?._seconds ? a.createdAt._seconds * 1000 : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?._seconds ? b.createdAt._seconds * 1000 : new Date(b.createdAt).getTime();
        return timeA - timeB;
      });
      
      if (isInitial) {
        setMessages(sortedMessages);
      } else {
        setMessages(prev => [...prev, ...sortedMessages]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text, files, fileIcon) => {
    try {
      // Use authToken instead of token
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        throw new Error("No authentication token found");
      }

      let attachments = [];
      if (files) {
        attachments = await handleFileUpload(files || []);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/adminChats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text || "",
            type: 'text',
            attachments: attachments || [],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", response.status, errorText);
        throw new Error(`Failed to send message: ${errorText}`);
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
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

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

  if (loading) return <div className="loading">Loading messages...</div>;

  return (
    <div className="f-chat-box">
      {!currentChat ? (
        <div>No messages</div>
      ) : (
        <>
          <ChatHeader currentChat={currentChat} />
          <div className="f-messages-container" ref={messagesContainerRef}>
            {loading ? (
              <div className="loading">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="no-messages">No messages yet</div>
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
        </>
      )}
    </div>
  );
};

export default ChatBox;
