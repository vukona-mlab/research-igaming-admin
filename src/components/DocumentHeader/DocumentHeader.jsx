import React, { useState } from "react";
import DocumentTabs from "../DocumentsTabs/DocumentTabs";
import "./DocumentHeader.css";
import NotificationsPage from "../../pages/notificationPage/NotificationsPage";
const Documents = () => {
  const [selectedTab, setSelectedTab] = useState("Documents");
  const [selectedFilter, setSelectedFilter] = useState("All"); // State for selected filter button

  return (
    <div className="documents-container">
      <DocumentTabs
        tabOne="Notifications"
        tabTwo="Documents"
        tabThree="Account"
        tabFour="Reviews"
        handleTabChange={setSelectedTab}
      />

      {/* Buttons Section */}
      {selectedTab !== "Notifications" && selectedTab !== "Account" && (
        <div className="filter-buttons">
          {["All", "Pending", "Approved", "Declined"].map((filter) => (
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
        {selectedTab === "Notifications" && <NotificationsPage />}

        {selectedTab === "Documents"}

        {selectedTab === "Account"}

        {selectedTab === "Reviews"}
      </div>
    </div>
  );
};

export default Documents;
