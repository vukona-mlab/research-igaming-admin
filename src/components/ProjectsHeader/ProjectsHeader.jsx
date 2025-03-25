import React, { useState } from "react";
import "./ProjectsHeader.css";
import SearchBar from "../../components/common/SearchBar/SearchBar";
const ProjectsHeader = ({ handleTabChange, onSearch }) => {
  const [currentTab, setCurrentTab] = useState("All");
  return (
    <div className="ProjectsHeader">
      <div className="pjh-search-view">
        <SearchBar placeholder="Search" onSearch={onSearch} />
        <div className="pjh-view-list-btn"></div>
      </div>
      <div className="pjh-active-tabs">
        <div className="pjh-active-tabs-heading">Projects</div>
        <div className="pjh-active-tabs-tabs-status">
          <div className="pjh-active-tabs-div">
            <button
              className={
                currentTab === "All"
                  ? "pjh-active-tabs-tab pjh-currentTab"
                  : "pjh-active-tabs-tab"
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
                  ? "pjh-active-tabs-tab pjh-currentTab"
                  : "pjh-active-tabs-tab"
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
                  ? "pjh-active-tabs-tab pjh-currentTab"
                  : "pjh-active-tabs-tab"
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
                  ? "pjh-active-tabs-tab pjh-currentTab"
                  : "pjh-active-tabs-tab"
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

export default ProjectsHeader;
