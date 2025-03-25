// NotificationsPage.jsx - Updates to use the SearchBar component
import React, { useState, useEffect } from "react";
import "./NotificationsPage.css";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import { requestForToken, onMessageListener } from "../../config/firebase";
import { useNavigate } from "react-router-dom";

const NotificationsPage = ({ searchTerm }) => {
  const [activeTab, setActiveTab] = useState("Notifications");
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search
  const navigation = useNavigate(); // For redirection after login

  // const [notifications, setNotifications] = useState([
  //   {
  //     id: 1,
  //     message:
  //       "You have Received R63 000 from Ri Experts for Roulette Game to STANDARD BANK account **********1111; REF 123F45568776UJ",
  //     date: "31 January 2025",
  //     read: false,
  //   },
  //   {
  //     id: 2,
  //     message:
  //       "You have Received R27 000 from Ri Experts for 777 Game to STANDARD BANK account **********1111;",
  //     date: "30 January 2025",
  //     read: false,
  //   },
  //   {
  //     id: 3,
  //     message:
  //       "You have Received R27 000 from Ri Experts for 777 Game to STANDARD BANK account **********1111;",
  //     date: "27 January 2025",
  //     read: false,
  //   },
  // ]);
  const [token, setToken] = useState("");
  const [notifications, setNotifications] = useState([]);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    getNotifications();
  }, []);
  useEffect(() => {
    getFilteredNotifications();
  }, [searchTerm]);
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await requestForToken();
        setToken(token);
      } catch (error) {
        console.log(error);
      }
    };

    getToken();
  }, []);

  onMessageListener()
    .then((payload) => {
      console.log("recieved, payoload", payload);
      setNotifications((prev) => [
        ...prev,
        {
          title: payload?.notification?.title,
          body: payload?.notification?.body,
        },
      ]);
    })
    .catch((err) => console.log("failed: ", err));
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter);
  };
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
  const handleDeleteNotification = async (id) => {
    try {
      console.log("clicked", id, authToken);
      const res = await fetch(
        `http://localhost:8000/api/admin-notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: authToken,
          },
        }
      );

      if (res.ok) {
        setNotifications(
          notifications.filter((notification) => notification.id !== id)
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  };
  const readNotification = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/admin-notifications/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: authToken,
            "Content-Length": "0",
          },
        }
      );

      if (res.ok) {
        getNotifications();
      }
    } catch (error) {
      throw new Error(error);
    }
  };
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Apply filter type
    switch (filterType) {
      case "Read":
        filtered = filtered.filter((notification) => notification.read);
        break;
      case "Unread":
        filtered = filtered.filter((notification) => !notification.read);
        break;
      default:
        break;
    }

    // Apply search query if exists
    if (searchTerm) {
      filtered = filtered.filter((notification) =>
        notification.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Custom header component to override NavBar styling
  const CustomHeader = () => (
    <div className="custom-header">
      <div className="header-logo">
        <img
          src="/images/logo-ri-express.png"
          alt="Ri Experts"
          className="logo"
        />
      </div>
      <div className="header-right">
        <div className="notification-bell">
          <img
            src="/images/carbon_notification-filled.png"
            alt="Notifications"
          />
        </div>
        <div className="user-info">
          <img
            src="/images/Frame 1149.png"
            alt="User"
            className="user-avatar"
          />
          <span className="user-name">Oscar Poco</span>
        </div>
      </div>
    </div>
  );
  console.log({ notifications });
  return (
    <div className="noti-dashboard-layout">
      <div className="noti-main-section">
        {/* Replace NavBar with custom header */}
        {/* <Sidebar/> */}
        {/* <div className="navbar-wrapper">
          <CustomHeader />
        </div> */}

        {/* Replace custom search with SearchBar component */}
        {/* <div className="search-container">
          <SearchBar placeholder="Search" onSearch={handleSearch} />
        </div> */}

        <div className="noti-main-content">
          {/* <div className="tabs-container">
            <div
              className={`tab ${activeTab === "Notifications" ? "active" : ""}`}
              onClick={() => handleTabChange("Notifications")}
            >
              Notifications
            </div>
            <div
              className={`tab ${activeTab === "Documents" ? "active" : ""}`}
              onClick={() => handleTabChange("Documents")}
            >
              Documents
            </div>
            <div
              className={`tab ${activeTab === "Account" ? "active" : ""}`}
              onClick={() => handleTabChange("Account")}
            >
              Account
            </div>
            <div
              className={`tab ${activeTab === "Reviews" ? "active" : ""}`}
              onClick={() => handleTabChange("Reviews")}
            >
              Reviews
            </div>
          </div> */}

          <div className="noti-filter-buttons">
            <button
              className={`noti-filter-btn ${
                filterType === "All" ? "active-filter" : ""
              }`}
              onClick={() => handleFilterChange("All")}
            >
              All
            </button>
            <button
              className={`noti-filter-btn ${
                filterType === "Read" ? "active-filter" : ""
              }`}
              onClick={() => handleFilterChange("Read")}
            >
              Read
            </button>
            <button
              className={`noti-filter-btn ${
                filterType === "Unread" ? "active-filter" : ""
              }`}
              onClick={() => handleFilterChange("Unread")}
            >
              Unread
            </button>
          </div>

          <div className="notifications-list">
            {getFilteredNotifications().map((notification) => (
              <div
                key={notification.id}
                className="notification-card"
                onClick={
                  notification.read
                    ? () => console.log()
                    : () =>
                        readNotification(
                          notification.id || notification.data.id
                        )
                }
              >
                <div className="notification-content">
                  <p className="notification-date">{notification.title}</p>
                  <p className="notification-message">{notification.body}</p>
                  <p className="notification-date">
                    {notification.date &&
                      notification.date._seconds &&
                      new Date(notification.date._seconds).toDateString()}
                  </p>
                </div>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDeleteNotification(
                      notification.id || notification.data.id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
