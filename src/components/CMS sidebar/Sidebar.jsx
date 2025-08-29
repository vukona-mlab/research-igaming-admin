import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import userIcon from "/public/images/user.png";
import dashIcon from "/public/images/dashIcon.png";
import messageIcon from "/public/images/messageIcon.png";
import projectIcon from "/public/images/projIcon.png";
import BACKEND_URL from "../../config/backend-config";

const Sidebar = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState("");
  const location = useLocation();

  useEffect(() => {
    // Fetch user data from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData(user);
      fetchProfile(user.uid);
    }
  }, []);

  const fetchProfile = async (adminId) => {
    const token = localStorage.getItem("authToken");

    if (!adminId || !token) {
      console.error("Missing adminId or token");
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/auth/admin/profile/${adminId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setProfilePicture(data.profile.profilePicture || "");
      } else {
        console.error("Error fetching profile:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // Notify parent component when sidebar state changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Top Section */}
      <div className="sidebar-inner">
        {/* Toggle Button */}
        <button
          className={`sidebar-button ${isOpen ? "open" : ""}`}
          onClick={toggleSidebar}
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="sidebar-menu-icon" />
        </button>

        {/* Navigation Items */}
        <div className="sidebar-nav">
          <SidebarItem
            imgSrc={dashIcon}
            text="Dashboard"
            to="/admin-dashboard"
            isOpen={isOpen}
          />
          <SidebarItem
            imgSrc={messageIcon}
            text="Messages"
            to="/messages"
            isOpen={isOpen}
          />
          <SidebarItem
            imgSrc={userIcon}
            text="Users"
            to="/users"
            isOpen={isOpen}
          />
          <SidebarItem
            imgSrc={projectIcon}
            text="Projects"
            to="/documents"
            isOpen={isOpen}
          />
        </div>
      </div>

      {/* Bottom Profile Section */}
      <div className="mb-4">
        <Link to="/profile" className="sidebar-profile">
          <img
            src={
              profilePicture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                userData?.displayName || ""
              )}&background=random`
            }
            alt="User"
            className="profile-img"
          />
          {isOpen && userData && (
            <div className="profile-details">
              <p className="font-semibold">{userData.displayName}</p>
              <p className="text-xs text-gray-300">{userData.email}</p>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ imgSrc, text, isOpen, to }) => {
  return (
    <Link to={to} className="sidebar-item">
      {imgSrc && <img src={imgSrc} alt="Icon" className={`sidebar-icon ${!isOpen ? "sidebar-icon-closed" : ""}`} />}
      {isOpen && <span className="sidebar-text">{text}</span>}
    </Link>
  );
};

export default Sidebar;
