import React, { useEffect, useRef, useState } from "react";
import MessageCard from "../MessageCard/MessageCard";
import ChatInput from "../messaging-inputs/ChatInput";
import "./ChatBox.css";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../config/firebase";
import ChatHeader from "../ChatHeader/ChatHeader";
import { io } from "socket.io-client";
import { format } from "date-fns";
import BACKEND_URL from "../../../config/backend-config";
import { BsPersonCircle, BsThreeDotsVertical } from "react-icons/bs";

const QueryChatBox = ({
    chatId,
    handleEndChat,
    messages,
    sendMessage,
    currentChat,
    currentClientId,
    currentClientName,
    isAdminChat,
    isInitiator,
}) => {
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

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const markMessagesAsReadDebounced = useRef(null);
    const buttonRef = useRef(null);
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
    useEffect(() => {
    }, [chatId]);

    useEffect(() => {
        if (messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {

    }, []);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        // console.log("Current token:", token);
    }, []);

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        // if (container && container.scrollTop === 0 && hasMore && !loading) {
        //   fetchMessages(page + 1, false);
        // }
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

    // Cleanup timeout on unmount
    useEffect(() => {

    }, []);

    // Update the getStructuredChatData function

    if (loading && messages.length === 0)
        return <div className="loading">Loading messages...</div>;


    // console.log("Final structured chat data:", structuredChatData); // Debug log

    return (
        <div className={`f-chat-box receiver`}>
            {!messages ? (
                <div className="no-messages">No messages</div>
            ) : (
                <>

                    {/* ChatHeader */}
                    <div className="chat-header">
                        <div className="chat-header-left">
                            <div className="avatar-wrapper">
                                <BsPersonCircle className="default-avatar" />
                                <span
                                    className={`online-status active`}
                                ></span>
                            </div>
                            <div className="user-info">
                                <h3 className="user-name">
                                    {"Anonymous"}
                                </h3>
                                <span className="user-status">
                                    Online
                                </span>
                            </div>
                        </div>
                        <div className="chat-header-right">
                            <button
                                className="options-button"
                                onClick={() => setShowMenu(!showMenu)}
                                ref={buttonRef}
                            >
                                <BsThreeDotsVertical />
                            </button>
                            {showMenu && (
                                <div className="context-menu" ref={menuRef}>
                                    <button onClick={handleEndChat}>End Chat</button>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* ChatHeader */}
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
                                {messages.map(
                                    (message, i) => (
                                        <MessageCard
                                            key={i}
                                            message={message}
                                            isCurrentUser={message.sender === "admin"}
                                        />
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

export default QueryChatBox;
