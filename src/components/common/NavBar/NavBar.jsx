import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "./navbar.css";

function NavBar() {
  const [profilePic, setProfilePic] = useState("/images/Frame 1149.png");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData(user);
      fetchProfile(user.uid);
    }
  }, []);

  const fetchProfile = async (adminId) => {
    const token = localStorage.getItem('authToken');
    
    if (!adminId || !token) {
      console.error("Missing adminId or token");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/auth/admin/profile/${adminId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setProfilePic(data.profile.profilePicture || "");
      } else {
        console.error("Error fetching profile:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand href="#">
          <div className="nav-logo">
            <img
              src="/images/logo-ri-express.png"
              alt="logo"
              className="logo"
            />
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto"></Nav>

          {/* Right section */}
          <div className="nav-right">
            <div className="bell-icon">
              <img
                src="/images/carbon_notification-filled.png"
                alt="Notifications"
              />
            </div>
            <div className="user-profile">
              <img 
                src={profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName || '')}&background=random`}
                alt="User" 
                className="profile-pic" 
              />
              <span className="user-name">{userData?.displayName || 'User'}</span>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
