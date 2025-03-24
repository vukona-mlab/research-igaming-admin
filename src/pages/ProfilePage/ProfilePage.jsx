import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import NotificationsSection from "../../components/profile/NotificationsSection/NotificationsSection";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import NavBar from "../../components/common/NavBar/NavBar";
import LogoutButton from "../../components/LogOut/Logout";

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

  const [formValues, setFormValues] = useState({
    name: "",
    surname: "",
    email: "",
    dob: "",
    phone: "",
    location: "",
    role: "",
  });

  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Profile Information");

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

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
            roles: data.profile.roles || "",
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
    const formData = new FormData();

    // Add the form fields to the FormData object
    for (let key in formValues) {
      if (key !== "profilePicture") {
        // Don't include profilePicture as it will be handled separately
        formData.append(key, formValues[key]);
      }
    }

    if (image) {
      formData.append("profilePicture", image);
    }

    try {
      const { email, role, ...formData } = formValues; // Exclude email and role from updates
      const response = await fetch(
        `http://localhost:8000/api/auth/admin/profile/${adminId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `${token}`,
          },
          body: formData,
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
      <NavBar />
      <Sidebar />
      <HeaderContainer>
        <Header>Account</Header>

        <LogoutButton>Logout</LogoutButton>
      </HeaderContainer>

      <Tabs>
        {["Profile Information", "Change Password", "Notifications"].map(
          (tab) => (
            <Tab
              key={tab}
              active={activeTab === tab}
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
            <ProfileImage
              onClick={() =>
                document.getElementById("profilePictureInput").click()
              }
            >
              <img
                src={
                  image
                    ? URL.createObjectURL(image)
                    : formValues.profilePicture || "images/empty.jpeg"
                }
                alt="Profile"
              />
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
          {/* File input for profile picture */}
          <input
            type="file"
            id="profilePictureInput"
            accept="image/*"
            onChange={handleFileChange}
            style={{ visibility: "hidden" }} // Hide the input field
          />
        </>
      )}
      {activeTab === "Change Password" && <div>Change Password Content</div>}
      {activeTab === "Notifications" && <NotificationsSection />}
    </Container>
  );
};

export default ProfilePage;
