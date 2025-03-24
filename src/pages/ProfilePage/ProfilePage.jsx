import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import NotificationsSection from "../../components/profile/NotificationsSection/NotificationsSection";
import Sidebar from "../../components/CMS sidebar/Sidebar";

const Container = styled.div`
  max-width: 1250px;
  margin-left: 210px;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

/* Header + Logout */
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

/* Profile Section + Edit Button */
const ProfileContainer = styled.div`
  display: flex;
  justify-content: space-between;
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

const EditButton = styled(Button)`
  margin-left: auto;
`;

const SaveButton = styled(Button)`
  margin-top: 20px;
`;

const ProfilePage = () => {
  const user = JSON.parse(localStorage.getItem("user")); // Parse the user object
  const adminId = user?.uid || ""; // Extract adminId safely
  const token = localStorage.getItem("authToken");

  console.log(localStorage.getItem("authToken"));

  const [formValues, setFormValues] = useState({
    name: "",
    surname: "",
    email: "",
    dob: "",
    phone: "",
    location: "",
    role: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Profile Information");

  // Fetch profile data when page loads
  useEffect(() => {
    const fetchProfile = async () => {
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
          setFormValues({
            name: data.profile.name || "",
            surname: data.profile.surname || "",
            email: data.profile.email || "",
            dob: data.profile.dob || "",
            phone: data.profile.phone || "",
            location: data.profile.location || "",
            role: data.profile.role || "",
          });
        } else {
          console.error("Error fetching profile:", data.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchProfile();
  }, [adminId, token]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle edit mode
  const toggleEdit = () => {
    if (isEditing) {
      handleSave();
    }
    setIsEditing(!isEditing);
  };

  // Save updated data to the backend
  const handleSave = async () => {
    try {
      const { email, role, ...updateData } = formValues; // Exclude email and role from updates
      const response = await fetch(
        `http://localhost:8000/api/auth/admin/profile/${adminId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Profile updated successfully!");
      } else {
        console.error("Update failed:", result.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <Container>
      <Sidebar />
      <HeaderContainer>
        <Header>Account</Header>
        <Button>Logout</Button>
      </HeaderContainer>

      <Tabs>
        <Tab
          active={activeTab === "Profile Information"}
          onClick={() => setActiveTab("Profile Information")}
        >
          Profile Information
        </Tab>
      </Tabs>

      {activeTab === "Profile Information" && (
        <>
          <ProfileContainer>
            <ProfileImage>
              <img src="images/Rectangle 258.png" alt="Profile" />
              <CameraIcon>📷</CameraIcon>
            </ProfileImage>
            <EditButton onClick={toggleEdit}>
              {isEditing ? "Save" : "Edit"}
            </EditButton>
          </ProfileContainer>

          <FormGrid
            component="form"
            sx={{ "& .MuiTextField-root": { m: 1, width: "100%" } }}
            noValidate
            autoComplete="off"
          >
            {Object.keys(formValues).map((key) => (
              <TextField
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={formValues[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={!isEditing || key === "email" || key === "role"}
              />
            ))}
          </FormGrid>
        </>
      )}
    </Container>
  );
};

export default ProfilePage;
