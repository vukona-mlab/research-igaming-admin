import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import NavBar from "../../components/common/NavBar/NavBar";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import ActiveUsersGraph from "../../components/ActiveUsersGraph/ActiveUsersGraph"
import ProjectStats from "../../components/ProjectsTable/ProjectsTable"
import TableStat from "../../components/TableStat/TableStat"

const AdminDashboard = () => {
  return (
    <div className="AdminDashboard">
      <Sidebar />
      <div className="amd-main-container">
        <NavBar />
        <div className="amd-main-content">
        <div className="amd-projects-stats-container">
            <ProjectStats/>
          </div>
          <div className="amd-projects-table-container">
            <TableStat/>
          </div>
          <div className="amd-graphs-container">
            <ActiveUsersGraph/>
          </div>
          
          <div className="amd-notifications-container"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
