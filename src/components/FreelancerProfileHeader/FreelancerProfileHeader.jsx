import React, { useState } from "react";
import DocumentTabs from "../DocumentsTabs/DocumentTabs";
import "./FreelancerProfileHeader.css";

const FreelancerProfileHeader = ({ searchTerm }) => {
  const [selectedTab, setSelectedTab] = useState("Profile");
  const [selectedFilter, setSelectedFilter] = useState("All");

  return (
    <div className="freelancer-profile-container">
      <DocumentTabs
        tabOne="Profile"
        tabTwo="Projects"
        tabThree="Earnings"
        tabFour="Settings"
        handleTabChange={setSelectedTab}
      />

      {/* Buttons Section */}
      {selectedTab === "Projects" && (
        <div className="filter-buttons">
          {["All", "Active", "Completed", "Cancelled"].map((filter) => (
            <button
              key={filter}
              className={selectedFilter === filter ? "selected" : ""}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      <div className="tab-content">
        {selectedTab === "Profile" && <div>Profile Content</div>}
        {selectedTab === "Projects" && <div>Projects Content</div>}
        {selectedTab === "Earnings" && <div>Earnings Content</div>}
        {selectedTab === "Settings" && <div>Settings Content</div>}
      </div>
    </div>
  );
};

export default FreelancerProfileHeader; 