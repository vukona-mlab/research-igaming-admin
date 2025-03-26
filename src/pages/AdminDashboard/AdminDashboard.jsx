import React, { useEffect, useState } from "react";
import axios from 'axios';
import "./AdminDashboard.css";
import NavBar from "../../components/common/NavBar/NavBar";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import NotificationsPanel from "../../components/AdminDashboard/NotificationsPanel/NotificationsPanel";
import ActiveUsersGraph from "../../components/AdminDashboard/ActiveUsersGraph/ActiveUsersGraph";
import ProjectStats from "../../components/AdminDashboard/ProjectsTable/ProjectsTable";
import TableStat from "../../components/AdminDashboard/TableStat/TableStat";
import SearchBar from "../../components/common/SearchBar/SearchBar";



const AdminDashboard = () => {

  
  return (
    <div className="AdminDashboard">
      <Sidebar />
      <div className="amd-main-container">
        <NavBar />
        <div className="amd-main-content">
          <div className="amd-stats-container">
          <SearchBar placeholder="Search" onSearch={() => {}} />
          <div className="amd-projects-stats-container">
            <ProjectStats />
          </div>
          <div className="amd-projects-table-container">
            <TableStat />
          </div>
          <div className="amd-graphs-container">
            <ActiveUsersGraph />
          </div>
          </div>

          <div className="amd-notifications-container">
            <NotificationsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
