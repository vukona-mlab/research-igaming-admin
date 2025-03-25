import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import ProjectList from "./../../ProjectList/ProjectList"; // Import ProjectList

export default function ProjectTabs() {
  const [selectedStatus, setSelectedStatus] = useState("pending"); // Default status

  const handleChange = (event, newValue) => {
    setSelectedStatus(newValue);
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "background.paper", boxShadow: 2, borderRadius: 1, p: 2 }}>
      {/* Tabs for Status Filtering */}
      <Tabs value={selectedStatus} onChange={handleChange} centered>
        <Tab label="Pending" value="pending" />
        <Tab label="In Progress" value="in-progress" />
        <Tab label="Completed" value="completed" />
        <Tab label="Cancelled" value="cancelled" />
      </Tabs>

      {/* Pass Selected Status to ProjectList */}
      <ProjectList statusFilter={selectedStatus} />
    </Box>
  );
}
