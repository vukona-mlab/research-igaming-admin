import React, { useRef, useState } from "react";
import { Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChatInput.css";
import { BsEmojiSmile, BsPaperclip, BsSend, BsMic } from "react-icons/bs";
import EmojiPicker from 'emoji-picker-react';

const ChatInput = ({
  files,
  setFiles,
  fileIcon,
  setFileIcon,
  text,
  setText,
  sendMessage,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(selectedFiles);
      if (selectedFiles[0].type.startsWith('image/')) {
        setFileIcon(URL.createObjectURL(selectedFiles[0]));
      }
    }
  };

  const handleEmojiClick = (emojiObject) => {
    const cursor = textareaRef.current.selectionStart;
    const textBefore = text.substring(0, cursor);
    const textAfter = text.substring(cursor);
    setText(textBefore + emojiObject.emoji + textAfter);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendClick();
    }
  };

  const handleSendClick = async () => {
    if (text.trim() || files || fileIcon) {
      try {
        // If there's an image file, use it from files array
        const imageFile = files && Array.from(files).find(file => file.type.startsWith('image/'));
        await sendMessage(text, files, imageFile || null);
        setText("");
        setFiles(null);
        setFileIcon(null);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error("Error in handleSendClick:", error);
      }
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  return (
    <div className="chat-input-wrapper">
      {/* Preview Selected Files */}
      {(files || fileIcon) && (
        <div className="file-preview">
          {files && Array.from(files).map((file, index) => (
            <div key={index} className="file-preview-item">
              {!file.type.startsWith('image/') && (
                <div className="file-name">
                  <span>{file.name}</span>
                  <button 
                    className="remove-file"
                    onClick={() => {
                      setFiles(null);
                      setFileIcon(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
          {fileIcon && (
            <div className="image-preview">
              <img src={fileIcon} alt="Preview" />
              <button 
                className="remove-file"
                onClick={() => {
                  setFiles(null);
                  setFileIcon(null);
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      <div className="chat-input">
        {/* Emoji Button */}
        <button 
          className="icon-button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <BsEmojiSmile />
        </button>

        {/* Attachment Button */}
        <button 
          className="icon-button"
          onClick={handleAttachmentClick}
        >
          <BsPaperclip />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*,.pdf,.doc,.docx,.mp3,.mp4"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Message Input */}
        <div className="message-input-wrapper">
          <textarea
            ref={textareaRef}
            className="message-input"
            placeholder="Type a message"
            value={text}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>


        {/* Send Button */}
        <button 
          className={`icon-button send-button ${(text.trim() || files || fileIcon) ? 'active' : ''}`}
          onClick={handleSendClick}
          disabled={!text.trim() && !files && !fileIcon}
        >
          <BsSend />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
