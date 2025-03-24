import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import userIcon from "/public/images/user.png";
import dashIcon from "/public/images/dashIcon.png";
import messageIcon from "/public/images/messageIcon.png";
import projectIcon from "/public/images/projIcon.png";

const Sidebar = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
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
      <div>
        {/* Toggle Button */}
        <button
          className={`sidebar-button ${isOpen ? "open" : ""}`}
          onClick={toggleSidebar}
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
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
            to="/freelancer" 
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
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="User"
            className="profile-img"
          />
          {isOpen && (
            <div className="profile-details">
              <p className="font-semibold">Anita Cruz</p>
              <p className="text-xs text-gray-300">anita@commerce.com</p>
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
      {imgSrc && (
        <img src={imgSrc} alt="Icon" className="sidebar-icon" />
      )}
      {isOpen && <span className="sidebar-text">{text}</span>}
    </Link>
  );
};

export default Sidebar;