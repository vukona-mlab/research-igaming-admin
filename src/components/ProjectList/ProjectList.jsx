import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProjectList.css";
import { IconButton, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";

export default function ProjectList({ statusFilter }) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState({});
  const [freelancers, setFreelancers] = useState({});
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }
    fetchProjects();
    fetchClients();
    fetchFreelancers();
  }, [statusFilter, navigate]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("authToken");
      if (token && !token.startsWith("Bearer ")) {
        token = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/projects`,
        {
          headers: { Authorization: token },
        }
      );

      // Filter projects based on selected status
      const filteredProjects = response.data.projects.filter(
        (project) =>
          project.status?.toLowerCase() === statusFilter.toLowerCase()
      );

      setProjects(filteredProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error.message);
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      let token = localStorage.getItem("authToken");
      if (token && !token.startsWith("Bearer ")) {
        token = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/clients`,
        {
          headers: { Authorization: token },
        }
      );

      const clientsMap = response.data.clients.reduce((acc, client) => {
        acc[client.id] = client;
        return acc;
      }, {});
      setClients(clientsMap);
    } catch (error) {
      console.error("Error fetching clients:", error);
      if (error.response?.status === 401) {
        navigate("/");
      }
    }
  };

  const fetchFreelancers = async () => {
    try {
      let token = localStorage.getItem("authToken");
      if (token && !token.startsWith("Bearer ")) {
        token = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/freelancers`,
        {
          headers: { Authorization: token },
        }
      );

      const freelancersMap = response.data.freelancers.reduce(
        (acc, freelancer) => {
          acc[freelancer.id] = freelancer;
          return acc;
        },
        {}
      );

      setFreelancers(freelancersMap);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      if (error.response?.status === 401) {
        navigate("/");
      }
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    try {
      let date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="project-container">
      <div className="overlord">
        <table className="table-container">
          <thead>
            <tr className="table-heading">
              <th>Client</th>
              <th>Project Ref</th>
              <th>Freelancer</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => {
                const client = clients[project.clientId] || {};
                const freelancer = freelancers[project.freelancerId] || {};
                return (
                  <tr key={project.id}>
                    <td>{client.name || "Unknown"}</td>
                    <td>{project.id}</td>
                    <td>{freelancer.name || "N/A"}</td>
                    <td>
                      <div
                        className={`status ${
                          project.status?.toLowerCase() || "pending"
                        }`}
                      >
                        {project.status}
                      </div>
                    </td>
                    <td>{formatDate(project.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <Button variant="contained" size="large">
                          View
                        </Button>
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "10px" }}
                >
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
