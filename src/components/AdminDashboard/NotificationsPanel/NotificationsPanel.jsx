import { useEffect, useState } from "react";
import NotificationCard from "../NotificationCard/NotificationCard";
import "./NotificationsPanel.css";
const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentTab, setCurrentTab] = useState("All");
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    getNotifications();
  }, []);
  const getNotifications = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/admin-notifications",
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
        setNotifications(data && data.notifications);
      }
    } catch (error) {
      console.error(error);
    }
  };
  console.log(notifications);
  return (
    <div className="NotificationsPanel">
      <div className="np-header">
        <div className="np-title">Notifications</div>
        <div className="np-mark">Mark all as read</div>
      </div>
      <div className="lh-active-tabs-div">
        <button
          className={
            currentTab === "All"
              ? "lh-active-tabs-tab lh-currentTab"
              : "lh-active-tabs-tab"
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
              ? "lh-active-tabs-tab lh-currentTab"
              : "lh-active-tabs-tab"
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
              ? "lh-active-tabs-tab lh-currentTab"
              : "lh-active-tabs-tab"
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
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <NotificationCard notification={notif} />
          ))
        ) : (
          <div>No notifications</div>
        )}
      </div>
      <div>
        <button className="np-see-all">See all</button>
      </div>
    </div>
  );
};
export default NotificationsPanel;
