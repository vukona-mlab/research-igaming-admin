import React, { useState } from "react";
import "./NotificationsSection.css";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import styled from "styled-components";
const ProfileImage = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 15px;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;
const CameraIcon = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: black;
  color: white;
  font-size: 12px;
  padding: 3px;
  border-radius: 50%;
`;
const NotificationsSection = () => {
  const [chatNotif, setChatNotif] = useState(false);
  const [userNotif, setUserNotif] = useState(false);
  const [projectNotif, setProjectNotif] = useState(false);
  const [allProjNotif, setAllProjNotif] = useState(false);
  return (
    <div className="NotificationsSection">
      <ProfileImage>
        <img src="images/Rectangle 258.png" alt="Profile" />
        <CameraIcon>📷</CameraIcon>
      </ProfileImage>
      <div className="ns-notifs-checks">
        <div className="ns-input-check">
          <div className="ns-input-check-text">
            Turn on all chats notifications
          </div>
          <ToggleSwitch value={chatNotif} handleSliderChange={setChatNotif} />
        </div>
        <div className="ns-input-check">
          <div className="ns-input-check-text">
            Turn on new user notification
          </div>
          <ToggleSwitch value={userNotif} handleSliderChange={setUserNotif} />
        </div>
        <div className="ns-input-check">
          <div className="ns-input-check-text">
            Turn on new project notification
          </div>
          <ToggleSwitch
            value={projectNotif}
            handleSliderChange={setProjectNotif}
          />
        </div>
        <div className="ns-input-check">
          <div className="ns-input-check-text">
            Turn on all project notification
          </div>
          <ToggleSwitch
            value={allProjNotif}
            handleSliderChange={setAllProjNotif}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationsSection;
