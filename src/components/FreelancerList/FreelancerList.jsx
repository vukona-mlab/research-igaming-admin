import React, { useState, useEffect } from "react";
import ListHeader from "../../components/common/ListHeader/ListHeader";
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
import Sidebar from "../../components/CMS sidebar/Sidebar"

const FreelanceList = () => {
  const [filter, setFilter] = useState("All");
  const [freelancers, setFreelancers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("freelancers"); // Track current view
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handler for sidebar toggle
  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

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
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.jobTitle && item.jobTitle.toLowerCase().includes(searchLower))
      );
    });

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar Component with toggle handler */}
      <Sidebar onToggle={handleSidebarToggle} />
      
      {/* Main content with responsive margin */}
      <Box 
        sx={{ 
          width: "100%", 
          marginLeft: sidebarOpen ? "200px" : "60px", 
          transition: "margin-left 0.3s ease-in-out",
          padding: 3 
        }}
      >
        {/* ListHeader Component */}
        <ListHeader 
          listName={viewMode === "freelancers" ? "Freelancers" : "Clients"}
          tab={filter}
          handleTabChange={handleTabChange}
          handleListNameChange={handleListNameChange}
          onSearch={handleSearch}
        />
        
        {/* Profile Section with custom notification icon */}
        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
          <Box 
            component="img" 
            src="/public/images//carbon_notification-filled.png" 
            alt="Notifications" 
            sx={{ 
              height: 24, 
              width: 24, 
              color: "#ffbf00",
              cursor: "pointer"
            }} 
          />
          <Avatar alt="Profile" src="/public/images/Frame 1149.png" />
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
    </Box>
  );
};

export default FreelanceList;