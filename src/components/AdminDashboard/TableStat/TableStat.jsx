import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./TableStat.css";

const TableStat = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Assuming you store the token in localStorage
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/stats`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setStats(response.data);
      } catch (err) {
        setError("Failed to fetch statistics");
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return null;

  const columns = [
    { key: "activeUsers", title: "Active Users" },
    { key: "activeClients", title: "Active Clients" },
    { key: "activeFreelancers", title: "Active Freelancers" },
    { key: "blockedUsers", title: "Blocked Users" },
    { key: "blockedClients", title: "Blocked Clients" },
    { key: "blockedFreelancers", title: "Blocked Freelancers" },
  ];

  const data = [
    {
      activeUsers: stats.activeUsers.toLocaleString(),
      activeClients: stats.activeClients.toLocaleString(),
      activeFreelancers: stats.activeFreelancers.toLocaleString(),
      blockedUsers: stats.blockedUsers.toLocaleString(),
      blockedClients: stats.blockedClients.toLocaleString(),
      blockedFreelancers: stats.blockedFreelancers.toLocaleString(),
    },
  ];

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={`${rowIndex}-${column.key}`}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableStat.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// Example usage:
const ExampleTable = () => {
  const columns = [
    { key: "activeUsers", title: "Active Users" },
    { key: "activeClients", title: "Active Clients" },
    { key: "activeFreelancer", title: "Active Freelancer" },
    { key: "blockedUsers", title: "Blocked Users" },
    { key: "blockedClients", title: "Blocked Clients" },
    { key: "blockedFreelancer", title: "Blocked Freelancer" },
  ];

  const data = [
    {
      activeUsers: "800 000",
      activeClients: "480 000",
      activeFreelancer: "320 000",
      blockedUsers: "520",
      blockedClients: "500",
      blockedFreelancer: "20",
    },
  ];

  return <TableStat data={data} columns={columns} />;
};

export default ExampleTable;
