import { useEffect, useState } from "react";
import NotificationCard from "../NotificationCard/NotificationCard";
import "./NotificationsPanel.css";
const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
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
    </div>
  );
};
export default NotificationsPanel;
