import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import NavBar from "../../components/common/NavBar/NavBar";
import Sidebar from "../../components/CMS sidebar/Sidebar";
const AdminDashboard = () => {
  return (
    <div className="AdminDashboard">
      <Sidebar />
      <div className="amd-main-container">
        <NavBar />
        <div className="amd-main-content">
          <div className="amd-graphs-container"></div>
          <div className="amd-notifications-container"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
