import React from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 900px;
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
  font-size: 12px;
  font-weight: bold;
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

const Edit = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  overflow: hidden;
  margin-: 15px;
  position: relative;
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  &:focus {
    border-color: #007bff;
  }
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
const RequiredInput = ({ label, isRequired }) => {
  const [value, setValue] = useState("");

  return (
    <Container>
      <Label>
        {label}
        {isRequired && <RequiredIndicator>*</RequiredIndicator>}
      </Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={isRequired}
      />
    </Container>
  );
};

const ProfilePage = () => {
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

      {/* Form Fields */}
      <FormGrid>
        <FormGroup>
          <Label>Name *</Label>
          <Input type="text" value="Sibusiso" disabled />
        </FormGroup>

        <FormGroup>
          <Label>Surname *</Label>
          <Input type="text" value="Sibusiso" disabled />
        </FormGroup>

        <FormGroup>
          <Label>Email *</Label>
          <Input type="email" value="Sibusiso@mail.com" disabled />
        </FormGroup>

        <FormGroup>
          <Label>Date of Birth *</Label>
          <Input type="text" value="DD/MM/YYYY" disabled />
        </FormGroup>

        <FormGroup>
          <Label>Phone *</Label>
          <Input type="text" value="078 000 0000" disabled />
        </FormGroup>

        <FormGroup>
          <Label>Location *</Label>
          <Input type="text" value="Soweto" disabled />
        </FormGroup>

        <FormGroup>
          <Label>Role *</Label>
          <Input type="text" value="Super Admin" disabled />
        </FormGroup>
      </FormGrid>

      {/* Buttons */}
      <Buttons>
        <LogoutButton>Logout</LogoutButton>
        <Edit>Edit</Edit>
      </Buttons>
    </Container>
  );
};

export default ProfilePage;
