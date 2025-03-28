import { useEffect, useState } from "react";
import NotificationCard from "../NotificationCard/NotificationCard";
import "./NotificationsPanel.css";
import { useNavigate } from "react-router-dom";
const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentTab, setCurrentTab] = useState("All");
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();
  useEffect(() => {
    getNotifications();
  }, []);
  useEffect(() => {
    const filteredData = notifications.filter((item) => {
      if (currentTab === "All") return true;
      if (currentTab === "Alerts") return item.type === "alert";
      if (currentTab === "Updates") return item.type === "update";
    });

    if (filteredData.length > 0) {
      setFilteredData(filteredData);
    } else {
      setFilteredData(notifications);
    }
  }, [currentTab]);
  const getNotifications = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin-notifications`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setNotifications(data && data.notifications.slice(0, 4));
        setFilteredData(data && data.notifications.slice(0, 4));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="NotificationsPanel">
      <div className="np-header">
        <div className="np-title">Notifications</div>
        <div className="np-mark">Mark all as read</div>
      </div>
      <div className="np-active-tabs-div">
        <button
          className={
            currentTab === "All"
              ? "np-active-tabs-tab np-currentTab"
              : "np-active-tabs-tab"
          }
          onClick={() => {
            setCurrentTab("All");
          }}
        >
          All
        </button>
        <button
          className={
            currentTab === "Alerts"
              ? "np-active-tabs-tab np-currentTab"
              : "np-active-tabs-tab"
          }
          onClick={() => {
            setCurrentTab("Alerts");
          }}
        >
          Alerts
        </button>
        <button
          className={
            currentTab === "Updates"
              ? "np-active-tabs-tab np-currentTab"
              : "np-active-tabs-tab"
          }
          onClick={() => {
            setCurrentTab("Updates");
          }}
        >
          Updates
        </button>
      </div>
      <div className="np-tabs"></div>
      <div className="np-body">
        {filteredData.length > 0 ? (
          filteredData.map((notif) => <NotificationCard notification={notif} />)
        ) : (
          <div>No notifications</div>
        )}
      </div>
      <div>
        <button className="np-see-all" onClick={() => navigate("/documents")}>
          See all
        </button>
      </div>
      <div className="np-msg-icon" onClick={() => navigate("/messages")}>
        <img src="/images/message.png" />
      </div>
    </div>
  );
};
export default NotificationsPanel;
