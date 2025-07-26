import React, { useEffect, useRef, useState } from "react";
import MessageCard from "../MessageCard/MessageCard";
import ChatInput from "../messaging-inputs/ChatInput";
import "./ChatBox.css";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../config/firebase";
import ChatHeader from "../ChatHeader/ChatHeader";
import { io } from "socket.io-client";
import { format } from "date-fns";

const ChatBox = ({
  chatId,
  currentChat,
  currentClientId,
  currentClientName,
  isAdminChat,
  isInitiator,
}) => {
  const [messages, setMessages] = useState([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState();
  const [fileIcon, setFileIcon] = useState();
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const bottomRef = useRef();
  const socketRef = useRef();
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const userRole = localStorage.getItem("role");
  const messagesContainerRef = useRef(null);
  const MESSAGES_PER_PAGE = 20;
  const typingTimeoutRef = useRef(null);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const markMessagesAsReadDebounced = useRef(null);

  useEffect(() => {
    if (chatId) {
      console.log("Fetching messages for chatId:", chatId);
      fetchMessages();

      // Clear any existing timeout
      if (markMessagesAsReadDebounced.current) {
        clearTimeout(markMessagesAsReadDebounced.current);
      }

      // Set a new timeout to mark messages as read
      markMessagesAsReadDebounced.current = setTimeout(() => {
        markMessagesAsRead();
      }, 500); // 500ms debounce
    }
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_API_URL);

    // Join the chat room when component mounts
    if (chatId) {
      if (isAdminChat) {
        socketRef.current.emit("join-admin-chat", chatId);
      } else {
        socketRef.current.emit("join-chat", chatId);
      }
    }

    // Listen for new messages
    socketRef.current.on("new-admin-message", (data) => {
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    // Listen for messages read status
    socketRef.current.on("messages-read", (data) => {
      if (data.chatId === chatId) {
        console.log("Received messages-read event:", data);
        // Update messages read status
        setMessages((prev) =>
          prev.map((msg) => {
            // If the message is from the current user and hasn't been read by the recipient
            if (
              msg.senderId === currentClientId &&
              !msg.readBy?.includes(data.userId)
            ) {
              console.log("Updating read status for message:", msg.id);
              return {
                ...msg,
                readBy: [...(msg.readBy || []), data.userId],
              };
            }
            return msg;
          })
        );
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
        if (isAdminChat) {
          socketRef.current.emit("leave-admin-chat", chatId);
        } else {
          socketRef.current.emit("leave-chat", chatId);
        }
      }
      socketRef.current.disconnect();
    };
  }, [chatId, currentClientId, isAdminChat]);

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
        `${
          import.meta.env.VITE_API_URL
        }/api/admin-chats/${chatId}/messages?page=${pageNum}&limit=${MESSAGES_PER_PAGE}`,
        {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
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
        const timeA = a.createdAt?._seconds
          ? a.createdAt._seconds * 1000
          : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?._seconds
          ? b.createdAt._seconds * 1000
          : new Date(b.createdAt).getTime();
        return timeA - timeB;
      });

      if (isInitial) {
        setMessages(sortedMessages);
      } else {
        setMessages((prev) => [...prev, ...sortedMessages]);
      }

      setHasMore(data.pagination?.hasMore || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0 && hasMore && !loading) {
      fetchMessages(page + 1, false);
    }
  };

  const sendMessage = async (text, files, fileIcon) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        throw new Error("No authentication token found");
      }

      // Validate chatId
      if (!chatId) {
        console.error("No chatId provided");
        throw new Error("No chatId provided");
      }

      let attachments = [];
      if (files) {
        attachments = await handleFileUpload(files || []);
      }

      // Get the current user's role from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.error("No user found in localStorage");
        throw new Error("No user found in localStorage");
      }

      const user = JSON.parse(userStr);
      console.log("Current user from localStorage:", user);

      if (!user.roles || !user.roles.length) {
        console.error("No role found for current user");
        throw new Error("No role found for current user");
      }

      const userRole = user.roles[0]; // Get the first role from the roles array

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin-chats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text || "",
            type: "text",
            attachments: attachments || [],
            senderId: currentClientId,
            senderName: currentClientName,
            isAdminChat: isAdminChat,
            senderRole: userRole,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", response.status, errorText);
        console.error("Request details:", {
          chatId,
          currentClientId,
          currentClientName,
          isAdminChat,
          userRole,
          participants: currentChat?.participants,
        });
        throw new Error(`Failed to send message: ${errorText}`);
      }

      // Clear input after successful send
      setText("");
      setFiles(null);
      setFileIcon(null);
    } catch (error) {
      console.error("Error sending message:", error);
      // You might want to show an error message to the user here
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

    messages.forEach((message) => {
      const date = new Date(
        message.createdAt?._seconds
          ? message.createdAt._seconds * 1000
          : message.createdAt
      );
      const dateStr = format(date, "EEEE, d, yyyy");

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(message);
    });

    return groups;
  };

  const markMessagesAsRead = async () => {
    if (isMarkingAsRead) return; // Prevent multiple simultaneous calls

    try {
      setIsMarkingAsRead(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      console.log("Marking messages as read for chat:", chatId);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin-chats/${chatId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to mark messages as read:", errorText);
        throw new Error(`Failed to mark messages as read: ${errorText}`);
      }

      // Update messages to show read status
      setMessages((prev) =>
        prev.map((msg) => {
          // Only update messages that haven't been read by the current user
          if (!msg.readBy?.includes(currentClientId)) {
            console.log("Marking message as read:", msg.id);
            return {
              ...msg,
              readBy: [...(msg.readBy || []), currentClientId],
            };
          }
          return msg;
        })
      );

      // Emit socket event to notify other participants
      if (socketRef.current) {
        console.log("Emitting messages-read event");
        socketRef.current.emit("messages-read", {
          chatId,
          userId: currentClientId,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (markMessagesAsReadDebounced.current) {
        clearTimeout(markMessagesAsReadDebounced.current);
      }
    };
  }, []);

  // Update the getStructuredChatData function
  const getStructuredChatData = () => {
    if (!currentChat) return null;

    console.log("Current chat data:", currentChat); // Debug log

    // If currentChat already has the correct structure, return it
    if (currentChat.metadata?.target || currentChat.metadata?.initiator) {
      return currentChat;
    }

    // Handle the case where currentChat has selectedParticipant
    if (currentChat.selectedParticipant) {
      const structuredData = {
        ...currentChat,
        metadata: {
          target: currentChat.selectedParticipant,
          initiator: {
            id: currentClientId,
            name: currentClientName,
          },
        },
      };
      console.log("Structured data with selectedParticipant:", structuredData); // Debug log
      return structuredData;
    }

    // Handle the case where currentChat has otherParticipant
    if (currentChat.otherParticipant) {
      const structuredData = {
        ...currentChat,
        metadata: {
          target: currentChat.otherParticipant,
          initiator: {
            id: currentClientId,
            name: currentClientName,
          },
        },
      };
      console.log("Structured data with otherParticipant:", structuredData); // Debug log
      return structuredData;
    }

    // Handle the case where currentChat has participants array
    if (currentChat.participants && Array.isArray(currentChat.participants)) {
      const otherParticipant = currentChat.participants.find((p) => {
        const pId = typeof p === "object" ? p.id : p;
        return pId !== currentClientId;
      });

      if (otherParticipant) {
        const structuredData = {
          ...currentChat,
          metadata: {
            target:
              typeof otherParticipant === "object"
                ? otherParticipant
                : {
                    id: otherParticipant,
                    name: currentChat.name || "Unknown User",
                  },
            initiator: {
              id: currentClientId,
              name: currentClientName,
            },
          },
        };
        console.log("Structured data with participants:", structuredData); // Debug log
        return structuredData;
      }
    }

    // Fallback case
    const structuredData = {
      ...currentChat,
      metadata: {
        target: {
          id: currentChat.id,
          name: currentChat.name || "Unknown User",
          profilePicture: currentChat.profilePicture,
        },
        initiator: {
          id: currentClientId,
          name: currentClientName,
        },
      },
    };
    console.log("Fallback structured data:", structuredData); // Debug log
    return structuredData;
  };

  if (loading && messages.length === 0)
    return <div className="loading">Loading messages...</div>;

  const structuredChatData = getStructuredChatData();
  console.log("Final structured chat data:", structuredChatData); // Debug log

  return (
    <div className={`f-chat-box ${isInitiator ? "initiator" : "receiver"}`}>
      {!structuredChatData ? (
        <div className="no-messages">No messages</div>
      ) : (
        <>
          <ChatHeader currentChat={structuredChatData} />
          <div
            className="f-messages-container"
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {loading && messages.length > 0 && (
              <div className="loading-more">Loading more messages...</div>
            )}
            {messages.length === 0 ? (
              <div className="no-messages">No messages yet</div>
            ) : (
              <div className="f-messages-wrapper">
                {Object.entries(groupMessagesByDate(messages)).map(
                  ([date, dateMessages]) => (
                    <div key={date} className="message-date-group">
                      <div className="date-divider">
                        <span className="date-label">{date}</span>
                      </div>
                      {dateMessages.map((msg, i) => (
                        <MessageCard
                          key={i}
                          message={msg}
                          isCurrentUser={msg.senderId === currentClientId}
                        />
                      ))}
                    </div>
                  )
                )}
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
