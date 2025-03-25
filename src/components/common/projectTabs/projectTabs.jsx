import React, { useState } from "react";
import "./projectTabs.css";
import SearchBar from "../SearchBar/SearchBar";

const ProjectTab = ({
  listName,
  handleTabChange,
  onSearch,
}) => {
  const [currentTab, setCurrentTab] = useState("all"); // Default to lowercase 'all'

  const getTabClass = (status) => {
    return currentTab === status.toLowerCase()
      ? "lh-active-tabs-tab lh-currentTab"
      : "lh-active-tabs-tab";
  };

  const handleClick = (status) => {
    const statusLowerCase = status.toLowerCase(); // Ensure status is in lowercase
    setCurrentTab(statusLowerCase); // Update the active tab
    handleTabChange(statusLowerCase); // Pass the lowercase status
    console.log(`Selected status: ${statusLowerCase}`); // Log the status
  };

  return (
    <div className="ListHeader">
      <div className="lh-search-view">
        <SearchBar placeholder="Search" onSearch={onSearch} />
        <button
          className="lh-view-list-btn"
          onClick={() => {
            handleTabChange(
              listName === "Clients" ? "Freelancers" : "Clients"
            );
          }}
        >
          {listName === "Clients" ? "View freelancer list" : "View client list"}
        </button>
      </div>

      <div className="lh-active-tabs">
        <div className="lh-active-tabs-heading">{listName}</div>
        <div className="lh-active-tabs-tabs-status">
          <div className="lh-active-tabs-div">
            {["all", "completed", "pending", "cancelled"].map((status) => (
              <button
                key={status}
                className={getTabClass(status)}
                onClick={() => handleClick(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} {/* Capitalize first letter */}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTab;
