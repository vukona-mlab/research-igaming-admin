import React, { useState, useEffect } from "react";

import {
  Box,
  Button,
  Typography,
  Avatar,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";

const FreelanceList = () => {
  const [filter, setFilter] = useState("all");
  const [freelancers, setFreelancers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("freelancers"); // New state to track current view

  // Fetch freelancers or clients from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint = viewMode === "freelancers" 
          ? "http://localhost:8000/api/freelancers" 
          : "http://localhost:8000/api/clients";
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${viewMode}: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (viewMode === "freelancers") {
          setFreelancers(data.freelancers || []);
        } else {
          setClients(data.clients || []);
        }
        setError(null);
      } catch (error) {
        console.error(`Error fetching ${viewMode}:`, error);
        setError(`Failed to load ${viewMode}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode]); // Re-fetch when viewMode changes

  // Format date function
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    try {
      // Handle Firestore timestamp objects
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };
    
  // Toggle between freelancers and clients view
  const toggleView = () => {
    setViewMode(viewMode === "freelancers" ? "clients" : "freelancers");
    setFilter("all"); // Reset filter when switching views
    setSearchTerm(""); // Reset search when switching views
  };

  // Get current data based on viewMode
  const currentData = viewMode === "freelancers" ? freelancers : clients;

  // Filter data based on selected filter and search term
  const filteredData = currentData
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "active") return item.activeStatus === true;
      if (filter === "blocked") return item.activeStatus === false;
      return true;
    })
    .filter((item) => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.jobTitle && item.jobTitle.toLowerCase().includes(searchLower))
      );
    });

  return (
    <Box sx={{ width: "90%", margin: "auto", padding: 3 }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">
          {viewMode === "freelancers" ? "Freelancers" : "Clients"}
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <NotificationsNoneIcon sx={{ color: "#ffbf00" }} />
          <Avatar alt="Profile" src="/profile.jpg" />
          <Button 
            variant="contained" 
            sx={{ backgroundColor: "black" }}
            onClick={toggleView}
          >
            {viewMode === "freelancers" ? "View client list" : "View freelancer list"}
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box display="flex" alignItems="center" mt={2} mb={2} position="relative">
        <SearchIcon sx={{ color: "gray", position: "absolute", marginLeft: 2 }} />
        <TextField
          variant="outlined"
          placeholder={`Search ${viewMode}...`}
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            maxWidth: 400,
            backgroundColor: "white",
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              paddingLeft: 1,
            },
            '& .MuiOutlinedInput-input': {
              paddingLeft: 4,
            }
          }}
        />
      </Box>

      {/* Filter Buttons */}
      <Box display="flex" gap={2} mb={2}>
        <Button
          variant={filter === "all" ? "contained" : "outlined"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "active" ? "contained" : "outlined"}
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          variant={filter === "blocked" ? "contained" : "outlined"}
          onClick={() => setFilter("blocked")}
        >
          Blocked
        </Button>
      </Box>

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
        /* Table */
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Position</b></TableCell>
                <TableCell><b>Phone</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>DOB</b></TableCell>
                <TableCell><b>Start Date</b></TableCell>
                <TableCell><b>Status</b></TableCell>
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
                        <Avatar src={item.profilePicture || "/default-avatar.jpg"} />
                        {item.displayName || item.name || "No Name"}
                      </Box>
                    </TableCell>
                    <TableCell>{item.jobTitle || "Client"}</TableCell>
                    <TableCell>{item.phoneNumber || "N/A"}</TableCell>
                    <TableCell>{item.email || "N/A"}</TableCell>
                    <TableCell>{item.dateOfBirth ? formatDate(item.dateOfBirth) : "N/A"}</TableCell>
                    <TableCell>{item.createdAt ? formatDate(item.createdAt) : "N/A"}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: item.activeStatus ? "green" : "red",
                          }}
                        />
                        <Typography variant="body2">
                          {item.activeStatus ? "Active" : "Inactive"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default FreelanceList;