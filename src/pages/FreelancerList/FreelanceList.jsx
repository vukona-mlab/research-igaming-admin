import React, { useState, useEffect, useRef } from "react";
import ListHeader from "../../components/common/ListHeader/ListHeader";
import NavBar from "../../components/common/NavBar/NavBar";
import {
  Box,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import axios, { all } from "axios";
import BACKEND_URL from "../../config/backend-config";
import { ContextMenu } from "../../components/ContextMenu/ContextMenu";

const FreelanceList = () => {
  const [filter, setFilter] = useState("All");
  const [freelancers, setFreelancers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("freelancers"); // Track current view
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contextMenuRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentTab, setCurrentTab] = useState("All");
  // Fetch freelancers and clients from the backend
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const fetchFreelancers = fetch(
        `${BACKEND_URL}/api/freelancers`,
        {
          method: "GET",
          headers: {
            Authorization: ` ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      ).then((res) => res.json());

      const fetchClients = fetch(
        `${BACKEND_URL}/api/clients`,
        {
          method: "GET",
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      ).then((res) => res.json());
      const [freelancerData, clientData] = await Promise.all([
        fetchFreelancers,
        fetchClients,
      ]);

      setFreelancers(freelancerData.freelancers || []);
      setClients(clientData.clients || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Format date function
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  // Toggle between freelancers and clients view
  const handleListNameChange = (listName) => {
    setViewMode(listName.toLowerCase());
    setFilter("All"); // Reset filter when switching views
    setSearchTerm(""); // Reset search when switching views
  };

  // Handle tab change
  const handleTabChange = (tabName) => {
    setFilter(tabName);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Get current data based on viewMode
  const currentData = viewMode === "freelancers" ? freelancers : clients;

  // Filter data based on selected filter and search term
  const filteredData = currentData
    .filter((item) => {
      const blocked = item.blocked ? item.blocked : false;
      if (filter === "All") return true;
      if (filter === "Active") return blocked === false;
      if (filter === "Blocked") return blocked === true;
      return true;
    })
    .filter((item) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.displayName &&
          item.displayName.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.jobTitle && item.jobTitle.toLowerCase().includes(searchLower))
      );
    });
  console.log({ filteredData });

  const handleContextMenuClick = (e) => {
    e.stopPropagation();
    setShowContextMenu(!showContextMenu);
  };

  const handleContextMenuAction = async (action, userId) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("authToken"); // Get the token which already includes 'Bearer' prefix

      const blocked = action === 'Block' ? true : false
      const res = await axios.put(
        `${BACKEND_URL}/api/auth/users/${userId}/status`,
        {
          blocked,
        },
        {
          headers: {
            Authorization: token, // Use the token directly as it already includes 'Bearer'
            "Content-Type": "application/json",
          },
        }
      );
      fetchData();
      // Call the parent component's callback to update the UI

      setShowContextMenu(false);
    } catch (error) {
      console.error("Error updating review status:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsUpdating(false);
    }
  };

  console.log({ freelancers, clients });
  return (
    <div>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div
        className={`main-content ${isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
          }`}
      >
        <NavBar />
        <ListHeader
          listName={viewMode === "freelancers" ? "Freelancers" : "Clients"}
          tab={filter}
          handleTabChange={handleTabChange}
          handleListNameChange={handleListNameChange}
          onSearch={handleSearch}
          setCurrentTab={setCurrentTab}
          currentTab={currentTab}
        />

        {/* Error Message */}
        {error && (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Name</b>
                  </TableCell>
                  <TableCell>
                    <b>Position</b>
                  </TableCell>
                  <TableCell>
                    <b>Phone</b>
                  </TableCell>
                  <TableCell>
                    <b>Email</b>
                  </TableCell>
                  <TableCell>
                    <b>DOB</b>
                  </TableCell>
                  <TableCell>
                    <b>Start Date</b>
                  </TableCell>
                  <TableCell>
                    <b>Status</b>
                  </TableCell>
                  <TableCell>
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No {viewMode} found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={item.profilePicture || "/default-avatar.jpg"}
                          />
                          {item.displayName || item.name || "No Name"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {item.jobTitle ||
                          (viewMode === "clients" ? "Client" : "N/A")}
                      </TableCell>
                      <TableCell>{item.phoneNumber || "N/A"}</TableCell>
                      <TableCell>{item.email || "N/A"}</TableCell>
                      <TableCell>
                        {item.dateOfBirth
                          ? formatDate(item.dateOfBirth)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {item.createdAt
                          ? formatDate(item.createdAt._seconds)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: item.blocked
                                ? !item.blocked
                                  ? "green"
                                  : "red"
                                : "green",
                            }}
                          />
                          <Typography variant="body2">
                            {item.blocked
                              ? !item.blocked
                                ? "Active"
                                : "Blocked"
                              : "Active"
                            }
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell className="context-menu-container">
                        <button
                          className="context-menu-button"
                          onClick={(e) => {
                            setCurrentUserId(item.id);
                            handleContextMenuClick(e);
                          }}
                          aria-label="More options"
                        >
                          <span className="context-menu-dots">⋮</span>
                        </button>
                        {showContextMenu && currentUserId == item.id && (
                          // <div className="context-menu">
                          //   <button
                          //     className="context-menu-item block"
                          //     onClick={() =>
                          //       handleContextMenuAction("Block", item.id)
                          //     }
                          //     disabled={isUpdating}
                          //   >
                          //     {isUpdating ? "Updating..." : "Block"}
                          //   </button>
                          //   <button
                          //     className="context-menu-item unblock"
                          //     onClick={() =>
                          //       handleContextMenuAction("Unblock", item.id)
                          //     }
                          //     disabled={isUpdating}
                          //   >
                          //     {isUpdating ? "Updating..." : "Unblock"}
                          //   </button>
                          // </div>
                          <ContextMenu item={item} handleContextMenuAction={handleContextMenuAction} isUpdating={isUpdating} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
};

export default FreelanceList;
