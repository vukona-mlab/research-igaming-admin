import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProjectList.css";
//import ProfileCard from "../Profilecard/ProfileCard";
import PersonIcon from "@mui/icons-material/Person";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu, MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/common/NavBar/NavBar";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import ProjectsHeader from "../ProjectsHeader/ProjectsHeader";
export default function ProjectList() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState({});
  const [freelancers, setFreelancers] = useState({});
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    fetchProjects();
    fetchClients();
    fetchFreelancers();
  }, [navigate]);
  useEffect(() => {
    const filteredData = searchResults
      .filter((item) => {
        if (filter === "All") return true;
        if (filter === "Completed") return item.status === "completed";
        if (filter === "Pending") return item.status === "pending";
        if (filter === "Cancelled") return item.status === "cancelled";
      })
      .filter((item) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
          (item.title && item.title.toLowerCase().includes(searchLower)) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower)) ||
          (item.clientId &&
            item.clientId.toLowerCase().includes(searchLower)) ||
          (item.freelancerId &&
            item.freelancerId.toLowerCase().includes(searchLower))
        );
      });

    if (filteredData.length > 0) {
      setSearchResults(filteredData);
    } else {
      setSearchResults(projects);
    }
  }, [filter, searchTerm]);

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
          headers: {
            Authorization: token,
          },
        }
      );
      // console.log("Projects data from API:", response.data.projects);
      setProjects(response.data.projects);
      setSearchResults(response.data.projects);
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
          headers: {
            Authorization: token,
          },
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
          headers: {
            Authorization: token,
          },
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

  const handleCloseProfile = () => {
    setSelectedProject(null);
  };

  const handleMenuOpen = (event, projectId) => {
    console.log(event, projectId);
    // setAnchorEl(event.currentTarget);
    // setSelectedId(projectId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    try {
      // console.log("Original date value:", dateValue);

      // Handle Firebase Timestamp format
      let date;
      if (dateValue?._seconds) {
        // Convert Firebase Timestamp to JavaScript Date
        date = new Date(
          dateValue._seconds * 1000 + dateValue._nanoseconds / 1000000
        );
      } else {
        date = new Date(dateValue);
      }

      // console.log("Parsed Date object:", date);

      if (!isNaN(date.getTime())) {
        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();
        const formattedDate = `${day} ${month}, ${year}`;
        // console.log("Formatted date:", formattedDate);
        return formattedDate;
      }
      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  // console.log({ projects });
  return (
    <div className="ProjectList">
      <Sidebar />
      <div className="pj-main-container">
        <NavBar />
        <ProjectsHeader handleTabChange={setFilter} onSearch={setSearchTerm} />
        <div className="project-container">
          {selectedProject && <ProfileCard onClose={handleCloseProfile} />}
          <div className="pj-overlord">
            <table className="pj-table-container">
              <tbody>
                <tr className="pj-table-heading">
                  <th className="pj-t-heading">Client</th>
                  <th className="pj-t-heading">Project Ref</th>
                  <th className="pj-t-heading">Freelancer</th>
                  <th className="pj-t-heading">Status</th>
                  <th className="pj-t-heading">Date</th>
                  <th className="pj-t-heading">Actions</th>
                </tr>
                {searchResults.map((project) => {
                  const client = clients[project.clientId] || {};
                  const freelancer = freelancers[project.freelancerId] || {};
                  return (
                    <tr key={project.id}>
                      <td className="pj-t-data">
                        <div className="client-info">
                          {client.profilePicture ? (
                            <img
                              src={client.profilePicture}
                              alt={client.name}
                              className="client-avatar"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              <PersonIcon />
                            </div>
                          )}
                          <div className="client-details">
                            <div className="client-name">
                              {client.name || "N/A"}
                            </div>
                            <div className="client-email">
                              {client.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="pj-t-data">
                        <span className="project-id">{project.id}</span>
                      </td>
                      <td className="pj-t-data">
                        {project.freelancerId ? (
                          <div className="freelancer-info">
                            {freelancer.profilePicture ? (
                              <img
                                src={freelancer.profilePicture}
                                alt={freelancer.name}
                                className="freelancer-avatar"
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            ) : (
                              <div className="avatar-placeholder">
                                <PersonIcon />
                              </div>
                            )}
                            <div className="freelancer-details">
                              <div className="freelancer-name">
                                {freelancer.name || "N/A"}
                              </div>
                              <div className="freelancer-email">
                                {freelancer.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span>N/A</span>
                        )}
                      </td>
                      <td className="pj-t-data">
                        <div
                          className={`active-blocked ${
                            project.status?.toLowerCase() || "pending"
                          }`}
                        >
                          <span className="status-indicator"></span>
                          {project.status}
                        </div>
                      </td>
                      <td className="pj-t-data">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="pj-t-data">
                        <div className="action-buttons">
                          <Button
                            variant="contained"
                            size="large"
                            className="action-button"
                          >
                            View
                          </Button>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, project.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              className="context-menu"
              PaperProps={{
                className: "context-menu",
              }}
            >
              <MenuItem onClick={handleMenuClose} className="context-menu-item">
                View
              </MenuItem>
              <MenuItem onClick={handleMenuClose} className="context-menu-item">
                Edit
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                className="context-menu-item delete"
              >
                Delete
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
}
