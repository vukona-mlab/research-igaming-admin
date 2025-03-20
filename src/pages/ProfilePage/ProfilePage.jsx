import React, { useState } from "react";
import styled from "styled-components";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import NotificationsSection from "../../components/profile/NotificationsSection/NotificationsSection";
const Container = styled.div`
  max-width: 1250px;
  margin-left: 180px;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

/* Flex container for Header + Logout Button */
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Header = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #888;
`;

/* Flex container for Profile Section + Edit Button */
const ProfileContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
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

const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
`;

const Tab = styled.div`
  padding: 10px 15px;
  cursor: pointer;
  font-size: 16px;
  color: #888;
  border-bottom: ${(props) => (props.active ? "3px solid #B90909" : "none")};
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

const Button = styled.button`
  width: 100px;
  height: 32px;
  background: black;
  color: white;
  border: 1px solid black;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* Logout Button */
const LogoutButton = styled(Button)`
  background: black;
  border: 1px solid black;
`;

/* Edit/Save Button */
const EditButton = styled(Button)`
  margin-left: auto;
`;

/* Save Button (Appears Below Form) */
const SaveButton = styled(Button)`
  margin-top: 20px;
`;

const ProfilePage = () => {
  const [formValues, setFormValues] = useState({
    name: "John",
    surname: "Doe",
    email: "johndoe@example.com",
    dob: "1990-01-01",
    phone: "+1234567890",
    location: "New York, USA",
    role: "Software Engineer",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Profile Information"); // Track active tab

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Container>
      {/* Header + Logout Button */}
      <HeaderContainer>
        <Header>Account</Header>
        <LogoutButton>Logout</LogoutButton>
      </HeaderContainer>

      {/* Tabs */}
      <Tabs>
        <Tab
          active={activeTab === "Profile Information"}
          onClick={() => handleTabClick("Profile Information")}
        >
          Profile Information
        </Tab>
        <Tab
          active={activeTab === "Change Password"}
          onClick={() => handleTabClick("Change Password")}
        >
          Change Password
        </Tab>
        <Tab
          active={activeTab === "Notifications"}
          onClick={() => handleTabClick("Notifications")}
        >
          Notifications
        </Tab>
      </Tabs>

      {/* Conditional Rendering of Content */}
      {activeTab === "Profile Information" && (
        <>
          {/* Profile Section + Edit Button */}
          <ProfileContainer>
            <ProfileSection>
              <ProfileImage>
                <img src="images/Rectangle 258.png" alt="Profile" />
                <CameraIcon>📷</CameraIcon>
              </ProfileImage>
            </ProfileSection>
            <EditButton onClick={toggleEdit}>
              {isEditing ? "Save" : "Edit"}
            </EditButton>
          </ProfileContainer>

          {/* Form Fields */}
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
              InputLabelProps={{ shrink: true }}
              disabled={!isEditing}
            />

            <TextField
              label={
                <>
                  Surname{" "}
                  {!formValues.surname && (
                    <RequiredIndicator>*</RequiredIndicator>
                  )}
                </>
              }
              value={formValues.surname}
              onChange={(e) => handleInputChange("surname", e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={!isEditing}
            />

            <TextField
              label={
                <>
                  Email{" "}
                  {!formValues.email && (
                    <RequiredIndicator>*</RequiredIndicator>
                  )}
                </>
              }
              type="email"
              value={formValues.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={!isEditing}
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
              InputLabelProps={{ shrink: true }}
              disabled={!isEditing}
            />

            <TextField
              label={
                <>
                  Phone{" "}
                  {!formValues.phone && (
                    <RequiredIndicator>*</RequiredIndicator>
                  )}
                </>
              }
              value={formValues.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={!isEditing}
            />

            <TextField
              label={
                <>
                  Location{" "}
                  {!formValues.location && (
                    <RequiredIndicator>*</RequiredIndicator>
                  )}
                </>
              }
              value={formValues.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={!isEditing}
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
              InputLabelProps={{ shrink: true }}
              disabled={!isEditing}
            />
          </FormGrid>
        </>
      )}

      {activeTab === "Change Password" && (
        <div>
          <h2>Change Password</h2>
          <p>Password change functionality will be implemented here.</p>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div>
          <h2>Notifications</h2>
          <p>Notification settings will be implemented here.</p>
          <NotificationsSection />
        </div>
      )}
    </Container>
  );
};

export default ProfilePage;
