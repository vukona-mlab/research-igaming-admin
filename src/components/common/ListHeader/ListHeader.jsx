import React, { useState } from "react";
import "./ListHeader.css";
import SearchBar from "../SearchBar/SearchBar";
const ListHeader = ({
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
                currentTab === "Active"
                  ? "lh-active-tabs-tab lh-currentTab"
                  : "lh-active-tabs-tab"
              }
              onClick={() => {
                setCurrentTab("Active");
                handleTabChange("Active");
              }}
            >
              Active
            </button>
            <button
              className={
                currentTab === "Blocked"
                  ? "lh-active-tabs-tab lh-currentTab"
                  : "lh-active-tabs-tab"
              }
              onClick={() => {
                setCurrentTab("Blocked");
                handleTabChange("Blocked");
              }}
            >
              Blocked
            </button>
          </div>
          <div className="lh-active-tabs-status">
            <div className="lh-active-tabs-status-active">
              <div className="lh-active-circle"></div>
              <div>Active</div>
            </div>
            <div className="lh-active-tabs-status-blocked">
              <div className="lh-blocked-circle"></div>
              <div>Blocked</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListHeader;
