import React from "react";
import "./PeopleComponent.css";
import PersonCard from "../PersonCard/PersonCard";

const PeopleComponent = ({
  people,
  setcurrentChatId,
  setCurrentClientId,
  setCurrentClientName,
}) => {
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
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
      hour: '2-digit', 
      minute: '2-digit'
    });

    // If message is from today
    if (date.toDateString() === now.toDateString()) {
      return timeString;
    }
    
    // If message is from yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // If message is from this week
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // If message is from this year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
    }
    
    // If message is from a different year
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="PeopleComponent">
      {people.length === 0 ? (
        <div>No chats</div>
      ) : (
        <>
          <div className="people-title">People</div>
          <div className="people-list">
            {people.map((person, i) => {
              const otherParticipant = person.participants?.find(
                (part) => part.uid !== localStorage.getItem("uid")
              );
              
              return (
                <div key={i} className="person-card-container">
                  <PersonCard
                    chatId={person.id}
                    otherId={otherParticipant?.uid || ""}
                    name={otherParticipant?.name || ""}
                    lastMessage={person.lastMessage}
                    timestamp={person.updatedAt}
                    photoUrl={otherParticipant?.photoURL || ""}
                    setcurrentChatId={setcurrentChatId}
                    setCurrentClientId={setCurrentClientId}
                    setCurrentClientName={setCurrentClientName}
                    formattedTime={formatLastMessageTime(person.updatedAt)}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PeopleComponent;
