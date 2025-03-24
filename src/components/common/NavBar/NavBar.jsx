import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "./navbar.css";

function NavBar() {
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
            {/* Notification bell */}
            <div className="user-profile">
              <img
                src="/images/Frame 1149.png"
                alt="User"
                className="profile-pic"
              />
              <span className="user-name">Oscar Poco</span>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
