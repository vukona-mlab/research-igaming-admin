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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Fetch freelancers from the backend
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/freelancers");
        if (!response.ok) {
          throw new Error(`Failed to fetch freelancers: ${response.statusText}`);
        }
        const data = await response.json();
        setFreelancers(data.freelancers);
        setError(null);
      } catch (error) {
        console.error("Error fetching freelancers:", error);
        setError("Failed to load freelancers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

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

  // Filter freelancers based on selected filter and search term
  const filteredFreelancers = freelancers
    .filter((freelancer) => {
      if (filter === "all") return true;
      if (filter === "active") return freelancer.activeStatus === true;
      if (filter === "blocked") return freelancer.activeStatus === false;
      return true;
    })
    .filter((freelancer) => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        (freelancer.name && freelancer.name.toLowerCase().includes(searchLower)) ||
        (freelancer.email && freelancer.email.toLowerCase().includes(searchLower)) ||
        (freelancer.jobTitle && freelancer.jobTitle.toLowerCase().includes(searchLower))
      );
    });

  return (
    <Box sx={{ width: "90%", margin: "auto", padding: 3 }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">
          Freelancers
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <NotificationsNoneIcon sx={{ color: "#ffbf00" }} />
          <Avatar alt="Profile" src="/profile.jpg" />
          <Button variant="contained" sx={{ backgroundColor: "black" }}>
            View client list
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box display="flex" alignItems="center" mt={2} mb={2} position="relative">
        <SearchIcon sx={{ color: "gray", position: "absolute", marginLeft: 2 }} />
        <TextField
          variant="outlined"
          placeholder="Search freelancers..."
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
        /* Freelancers Table */
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
              {filteredFreelancers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No freelancers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFreelancers.map((freelancer) => (
                  <TableRow key={freelancer.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={freelancer.profilePicture || "/default-avatar.jpg"} />
                        {freelancer.displayName || freelancer.name || "No Name"}
                      </Box>
                    </TableCell>
                    <TableCell>{freelancer.jobTitle || "N/A"}</TableCell>
                    <TableCell>{freelancer.phoneNumber || "N/A"}</TableCell>
                    <TableCell>{freelancer.email || "N/A"}</TableCell>
                    <TableCell>{freelancer.dateOfBirth ? formatDate(freelancer.dateOfBirth) : "N/A"}</TableCell>
                    <TableCell>{freelancer.createdAt ? formatDate(freelancer.createdAt) : "N/A"}</TableCell>
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
                            backgroundColor: freelancer.activeStatus ? "green" : "red",
                          }}
                        />
                        <Typography variant="body2">
                          {freelancer.activeStatus ? "Active" : "Inactive"}
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