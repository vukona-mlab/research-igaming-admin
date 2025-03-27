import React, { useState } from "react";
import DocumentTabs from "../DocumentsTabs/DocumentTabs";
import "./DocumentHeader.css";
import NotificationsPage from "../../pages/notificationPage/NotificationsPage";
import DocumentsList from "../DocumentsList/DocumentsList";
import ReviewPage from "../../pages/ReviewPage/Reviews"; // Import the Reviews component

const Documents = ({ searchTerm }) => {
  const [selectedTab, setSelectedTab] = useState("Notifications");
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
        {selectedTab === "Notifications" && (
          <NotificationsPage searchTerm={searchTerm} />
        )}

        {selectedTab === "Documents" && <DocumentsList />}

        {selectedTab === "Account" && null}

        {selectedTab === "Reviews" && <ReviewPage />}
      </div>
    </div>
  );
};

export default Documents;