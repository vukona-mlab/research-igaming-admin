import React from "react";
import "./MessageButton.css"
const MessageButton = () => {
  return (
    <button 
      className="message-button"
      onClick={() => alert("Message button clicked!")}
    >
      Message
    </button>
  );
};

export default MessageButton;
