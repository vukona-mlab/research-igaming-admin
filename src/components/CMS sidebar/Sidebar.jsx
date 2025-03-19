import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Sidebar.css";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import userIcon from "/public/images/user.png"; // Import user image
import dashIcon from "/public/images/dashIcon.png"; // Import dashboard icon
import messageIcon from "/public/images/messageIcon.png"; // Import messages icon
import projectIcon from "/public/images/projIcon.png"; // Import projects icon

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`h-screen ${isOpen ? "w-64" : "w-16"} bg-black transition-all duration-300 flex flex-col justify-between`}>
      {/* Top Section */}
      <div>
        {/* Toggle Button */}
       <button
  className="sidebar-button bg-transparent"
  onClick={() => setIsOpen(!isOpen)}
>
  <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
</button>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-6 mt-4">
          <SidebarItem imgSrc={dashIcon} text="Dashboard" isOpen={isOpen} active /> {/* Dashboard icon updated */}
          <SidebarItem imgSrc={messageIcon} text="Messages" isOpen={isOpen} /> {/* Messages icon updated */}
          <SidebarItem imgSrc={userIcon} text="Users" isOpen={isOpen} /> {/* User icon unchanged */}
          <SidebarItem imgSrc={projectIcon} text="Projects" isOpen={isOpen} /> {/* Projects icon updated */}
        </nav>
      </div>

      {/* Bottom Profile Section */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 p-4 bg-red-600 text-white rounded-lg mx-2 cursor-pointer">
        <img
  src="https://randomuser.me/api/portraits/women/44.jpg"
  alt="User"
  className="profile-img"
/>
          {isOpen && (
            <div>
              <p className="font-semibold">Anita Cruz</p>
              <p className="text-xs text-gray-300">anita@commerce.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ icon, imgSrc, text, isOpen, active }) => {
  return (
    <div
      className={`flex items-center space-x-3 p-4 cursor-pointer ${active ? "bg-red-600 text-white" : "text-gray-400"} hover:bg-red-600 hover:text-white mx-2 rounded-lg`}
    >
      {imgSrc ? (
        <img src={imgSrc} alt="Icon" className="w-6 h-6" /> // Custom image
      ) : (
        <FontAwesomeIcon icon={icon} className="text-xl" />
      )}
      {isOpen && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
};

export default Sidebar;