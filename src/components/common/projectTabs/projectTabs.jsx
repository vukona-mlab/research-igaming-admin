import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import ProjectList from "./../../ProjectList/ProjectList"; // Import ProjectList
import "./ProjectTabs.css"; // Import the CSS file

export default function ProjectTabs() {
  const [selectedStatus, setSelectedStatus] = useState("pending"); // Default status

  const handleChange = (event, newValue) => {
    setSelectedStatus(newValue);
  };

  return (
    <Box className="tabs-container">
      {/* Tabs for Status Filtering */}
      <Tabs
        value={selectedStatus}
        onChange={handleChange}
        className="tabs-container"
        TabIndicatorProps={{
          style: { display: "none" } // Hide indicator line
        }}
      >
        <Tab label="Pending" value="pending" />
        <Tab label="In Progress" value="in-progress" />
        <Tab label="Completed" value="completed" />
        <Tab label="Cancelled" value="cancelled" />
      </Tabs>

      {/* Pass Selected Status to ProjectList */}
      <Box className="project-list-container">
        <ProjectList statusFilter={selectedStatus} />
      </Box>
    </Box>
  );
}
