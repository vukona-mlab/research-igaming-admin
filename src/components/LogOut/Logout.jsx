import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Redirect to the login page
    navigate("/");
  };

  return <Button onClick={handleLogout}>Logout</Button>;
};

const Button = styled.button`
  width: 100px;
  height: 32px;
  background: black;
  color: white;
  border: 1px solid black;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;
export default LogoutButton;
