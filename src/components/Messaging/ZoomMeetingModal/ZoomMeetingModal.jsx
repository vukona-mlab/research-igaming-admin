import React, { useState, useEffect } from 'react';
import './ZoomMeetingModal.css';

const ZoomMeetingModal = ({ isOpen, onClose, meetingDetails, isInvitation, onResponse }) => {
  const [zoomWindow, setZoomWindow] = useState(null);

  if (!isOpen) return null;

  const getMeetingNumber = (url) => {
    const match = url?.match(/j\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleJoinMeeting = () => {
    const meetingNumber = getMeetingNumber(meetingDetails.join_url);
    const browserJoinUrl = `https://zoom.us/wc/${meetingNumber}/join?pwd=${meetingDetails.password}`;
    
    // Close previous window if it exists
    if (zoomWindow && !zoomWindow.closed) {
      zoomWindow.close();
    }

    // Open new window with specific dimensions
    const windowWidth = 1000;
    const windowHeight = 600;
    const left = (window.screen.width - windowWidth) / 2;
    const top = (window.screen.height - windowHeight) / 2;

    const newWindow = window.open(
      browserJoinUrl,
      'ZoomMeeting',
      `width=${windowWidth},height=${windowHeight},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    setZoomWindow(newWindow);

    // Add window close event listener
    if (newWindow) {
      const checkWindow = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkWindow);
          onClose();
        }
      }, 1000);
    }

    if (Notification.permission === 'granted') {
      new Notification('Joining Meeting', {
        body: 'Opening Zoom meeting in a new window',
        icon: '/path/to/notification-icon.png'
      });
    }

    if (onResponse) {
      onResponse('accepted');
    }
  };

  const handleDecline = () => {
    if (Notification.permission === 'granted') {
      new Notification('Meeting Declined', {
        body: 'You declined the video call invitation',
        icon: '/path/to/notification-icon.png'
      });
    }

    if (onResponse) {
      onResponse('declined');
    }
    onClose();
  };

  return (
    <div className="zoom-modal-overlay">
      <div className="zoom-modal">
        <div className="zoom-modal-header">
          <h2>{isInvitation ? 'Meeting Invitation' : 'Video Call'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="zoom-modal-content">
          <div className="meeting-info">
            {isInvitation ? (
              <>
                <h3>{meetingDetails.initiatorName} is inviting you to join a meeting</h3>
                <div className="invitation-buttons">
                  <button className="join-button" onClick={handleJoinMeeting}>
                    Accept & Join
                  </button>
                  <button className="decline-button" onClick={handleDecline}>
                    Decline
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Meeting Details</h3>
                <p>Meeting ID: {getMeetingNumber(meetingDetails?.join_url)}</p>
                <p>Password: {meetingDetails?.password}</p>
                <button className="join-button" onClick={handleJoinMeeting}>
                  Join Meeting
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomMeetingModal; 