import React, { useState } from "react";
import styled from "styled-components";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

const Container = styled.div`
  max-width: 1200px;
  margin-left: 180px;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Header = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #888;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
`;

const Tab = styled.div`
  padding: 10px 15px;
  cursor: pointer;
  font-size: 16px;
  color: ${(props) => (props.active ? "black" : "#888")};
  border-bottom: ${(props) => (props.active ? "2px solid red" : "none")};
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ProfileImage = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 15px;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const CameraIcon = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: black;
  color: white;
  font-size: 12px;
  padding: 3px;
  border-radius: 50%;
`;

const FormGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const RequiredIndicator = styled.span`
  color: red;
  margin-left: 4px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  background: black;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
`;

const LogoutButton = styled(Button)`
  margin-right: 10px;
`;

const ProfilePage = () => {
  // State to track input values
  const [formValues, setFormValues] = useState({
    name: "",
    surname: "",
    email: "",
    dob: "",
    phone: "",
    location: "",
    role: "",
  });

  // Function to handle input changes
  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Container>
      <Header>Account</Header>

      {/* Tabs */}
      <Tabs>
        <Tab active>Profile Information</Tab>
        <Tab>Change Password</Tab>
        <Tab>Notifications</Tab>
      </Tabs>

      {/* Profile Section */}
      <ProfileSection>
        <ProfileImage>
          <img src="images/Rectangle 258.png" alt="Profile" />
          <CameraIcon>📷</CameraIcon>
        </ProfileImage>
      </ProfileSection>

      {/* Form Fields using Material-UI */}
      <FormGrid
        component="form"
        sx={{ "& .MuiTextField-root": { m: 1, width: "100%" } }}
        noValidate
        autoComplete="off"
      >
        <TextField
          label={
            <>
              Name{" "}
              {!formValues.name && <RequiredIndicator>*</RequiredIndicator>}
            </>
          }
          value={formValues.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          InputLabelProps={{ shrink: true }} // Keeps label at the top
        />

        <TextField
          label={
            <>
              Surname{" "}
              {!formValues.surname && <RequiredIndicator>*</RequiredIndicator>}
            </>
          }
          value={formValues.surname}
          onChange={(e) => handleInputChange("surname", e.target.value)}
          InputLabelProps={{ shrink: true }} // Keeps label at the top
        />

        <TextField
          label={
            <>
              Email{" "}
              {!formValues.email && <RequiredIndicator>*</RequiredIndicator>}
            </>
          }
          type="email"
          value={formValues.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          InputLabelProps={{ shrink: true }} // Keeps label at the top
        />

        <TextField
          label={
            <>
              Date of Birth{" "}
              {!formValues.dob && <RequiredIndicator>*</RequiredIndicator>}
            </>
          }
          value={formValues.dob}
          onChange={(e) => handleInputChange("dob", e.target.value)}
          InputLabelProps={{ shrink: true }} // Keeps label at the top
        />

        <TextField
          label={
            <>
              Phone{" "}
              {!formValues.phone && <RequiredIndicator>*</RequiredIndicator>}
            </>
          }
          value={formValues.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          InputLabelProps={{ shrink: true }} // Keeps label at the top
        />

        <TextField
          label={
            <>
              Location{" "}
              {!formValues.location && <RequiredIndicator>*</RequiredIndicator>}
            </>
          }
          value={formValues.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          InputLabelProps={{ shrink: true }} // Keeps label at the top
        />

        <TextField
          label={
            <>
              Role{" "}
              {!formValues.role && <RequiredIndicator>*</RequiredIndicator>}
            </>
          }
          value={formValues.role}
          onChange={(e) => handleInputChange("role", e.target.value)}
          InputLabelProps={{ shrink: true }} // Keeps label at the top
        />
      </FormGrid>

      {/* Buttons */}
      <Buttons>
        <LogoutButton>Logout</LogoutButton>
        <Button>Edit</Button>
      </Buttons>
    </Container>
  );
};

export default ProfilePage;
