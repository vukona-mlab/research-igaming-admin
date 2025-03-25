import React, { useState, useEffect } from "react";
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

const FreelanceList = () => {
  const [filter, setFilter] = useState("All");
  const [freelancers, setFreelancers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("freelancers"); // Track current view

  // Fetch freelancers or clients from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Update endpoints based on your route definitions
        const endpoint = viewMode === "freelancers" 
          ? "http://localhost:8000/api/freelancers" 
          : "http://localhost:8000/api/clients"; // Endpoint for fetching clients
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${viewMode}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (viewMode === "freelancers") {
          setFreelancers(data.freelancers || []);
        } else {
          // Handle clients data - the API returns clients in an object with clients property
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
      if (filter === "All") return true;
      if (filter === "Active") return item.activeStatus === true;
      if (filter === "Blocked") return item.activeStatus === false;
      return true;
    })
    .filter((item) => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.displayName && item.displayName.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.jobTitle && item.jobTitle.toLowerCase().includes(searchLower))
      );
    });

  return (
    <Box sx={{ width: "90%", margin: "auto", padding: 3 }}>
      <NavBar/>
      {/* Top Header with Profile Section and notification icon - Moved to the top */}
      
      {/* Sidebar Component */}
      <Sidebar/>
      
      {/* ListHeader Component */}
      <ListHeader 
        listName={viewMode === "freelancers" ? "Freelancers" : "Clients"}
        tab={filter}
        handleTabChange={handleTabChange}
        handleListNameChange={handleListNameChange}
        onSearch={handleSearch}
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
        /* Table */
        <TableContainer component={Paper} className="overlord">
          <Table className="table-container">
            <TableHead>
              <TableRow className="table-heading">
                <TableCell className="t-heading"><b>Name</b></TableCell>
                <TableCell className="t-heading"><b>Position</b></TableCell>
                <TableCell className="t-heading"><b>Phone</b></TableCell>
                <TableCell className="t-heading"><b>Email</b></TableCell>
                <TableCell className="t-heading"><b>DOB</b></TableCell>
                <TableCell className="t-heading"><b>Start Date</b></TableCell>
                <TableCell className="t-heading"><b>Status</b></TableCell>
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
                    <TableCell className="t-data">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={item.profilePicture || "/default-avatar.jpg"} />
                        {item.displayName || item.name || "No Name"}
                      </Box>
                    </TableCell>
                    <TableCell className="t-data">{item.jobTitle || (viewMode === "clients" ? "Client" : "N/A")}</TableCell>
                    <TableCell className="t-data">{item.phoneNumber || "N/A"}</TableCell>
                    <TableCell className="t-data">{item.email || "N/A"}</TableCell>
                    <TableCell className="t-data">{item.dateOfBirth ? formatDate(item.dateOfBirth) : "N/A"}</TableCell>
                    <TableCell className="t-data">{item.createdAt ? formatDate(item.createdAt) : "N/A"}</TableCell>
                    <TableCell className="t-data">
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