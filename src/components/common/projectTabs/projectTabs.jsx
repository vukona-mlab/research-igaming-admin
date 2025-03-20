import React, { useState } from "react";
import "./projectTabs.css";
import SearchBar from "../SearchBar/SearchBar";

const ProjectTab = ({
  listName,
  tab,
  handleTabChange,
  handleListNameChange,
  onSearch,
}) => {
  const [currentTab, setCurrentTab] = useState("All");

  return (
    <div className="ListHeader">
      <div className="lh-search-view">
        <SearchBar placeholder="Search" onSearch={onSearch} />
        <button
          className="lh-view-list-btn"
          onClick={() => {
            handleListNameChange(
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
            <button
              className={
                currentTab === "All"
                  ? "lh-active-tabs-tab lh-currentTab"
                  : "lh-active-tabs-tab"
              }
              onClick={() => {
                setCurrentTab("All");
                handleTabChange("All");
              }}
            >
              All
            </button>

            <button
              className={
                currentTab === "Completed"
                  ? "lh-active-tabs-tab lh-currentTab"
                  : "lh-active-tabs-tab"
              }
              onClick={() => {
                setCurrentTab("Completed");
                handleTabChange("Completed");
              }}
            >
              Completed
            </button>

            <button
              className={
                currentTab === "Pending"
                  ? "lh-active-tabs-tab lh-currentTab"
                  : "lh-active-tabs-tab"
              }
              onClick={() => {
                setCurrentTab("Pending");
                handleTabChange("Pending");
              }}
            >
              Pending
            </button>

            <button
              className={
                currentTab === "Cancelled"
                  ? "lh-active-tabs-tab lh-currentTab"
                  : "lh-active-tabs-tab"
              }
              onClick={() => {
                setCurrentTab("Cancelled");
                handleTabChange("Cancelled");
              }}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTab;
