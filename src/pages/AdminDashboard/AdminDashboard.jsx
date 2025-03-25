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
      </div>
    </div>
  );
};

export default AdminDashboard;
