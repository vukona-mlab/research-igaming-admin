import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import NavBar from "../../components/common/NavBar/NavBar";

const Container = styled.div`
  max-width: 1250px;
  margin-left: 180px;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

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
  border-bottom: ${(props) => (props.isActive ? "3px solid #B90909" : "none")};
`;

const FormGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
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

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Profile Information");
  const [formValues, setFormValues] = useState({});

  // Load saved profile values when the component mounts
  useEffect(() => {
    const savedValues = localStorage.getItem("profileFormValues");
    if (savedValues) {
      setFormValues(JSON.parse(savedValues));
    }
  }, []);

  // Save changes to localStorage when formValues update
  useEffect(() => {
    if (Object.keys(formValues).length > 0) {
      localStorage.setItem("profileFormValues", JSON.stringify(formValues));
    }
  }, [formValues]);

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <NavBar />
      <Container>
        <HeaderContainer>
          <Header>Account</Header>
          <Button>Logout</Button>
        </HeaderContainer>
        <Tabs>
          {["Profile Information", "Change Password", "Notifications"].map(
            (tab) => (
              <Tab
                key={tab}
                isActive={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Tab>
            )
          )}
        </Tabs>
        {activeTab === "Profile Information" && (
          <>
            <ProfileContainer>
              <ProfileSection>
                <ProfileImage>
                  <img
                    src={
                      formValues.profileImage || "images/default_profile.jpg"
                    }
                    alt="Profile"
                  />
                  <CameraIcon>📷</CameraIcon>
                </ProfileImage>
              </ProfileSection>
              <Button onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Save" : "Edit"}
              </Button>
            </ProfileContainer>
            <FormGrid>
              {[
                "name",
                "surname",
                "email",
                "dob",
                "phone",
                "location",
                "role",
              ].map((field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formValues[field] || ""}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  disabled={!isEditing}
                />
              ))}
            </FormGrid>
          </>
        )}
      </Container>
    </>
  );
};

export default ProfilePage;
