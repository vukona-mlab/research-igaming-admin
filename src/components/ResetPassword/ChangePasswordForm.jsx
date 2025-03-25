import React, { useState } from "react";
import "./ChangePasswordForm.css";

const ChangePasswordForm = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/80");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  return (
    <div className="password-form-container">
      <div className="profile-section">
        <img src={profileImage} alt="Profile" className="profile-pic" />
        <label className="upload-icon">
          <img src="/images/camera-icon.png" alt="Upload" className="camera-icon" />
          <input type="file" className="file-input" accept="image/*" onChange={handleImageChange} />
        </label>
      </div>

      <form className="password-form">
        <div className="form-group">
          <label className="input-label">Old Password <span>*</span></label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="input-label">New Password <span>*</span></label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="input-label">Confirm Password <span>*</span></label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
