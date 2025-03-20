import React, { useState } from "react";
import "./ProjectModal.css";
import { io } from "socket.io-client";

const ProjectModal = ({
  isOpen,
  onClose,
  chatId,
  isClientView,
  projectData,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    category: "Game Development",
    requirements: "",
  });

  const categories = [
    "Game Development",
    "Creative & Design",
    "Audio & Music",
    "Content & Marketing",
    "Quality Assurance",
    "Compliance & Legal",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Ensure we have the required IDs
      if (!projectData.clientId || !projectData.freelancerId) {
        console.error("Missing required IDs:", { projectData });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            ...formData,
            clientId: projectData.clientId,
            freelancerId: projectData.freelancerId,
            requirements: formData.requirements
              .split(",")
              .map((req) => req.trim()),
            deadline: parseInt(formData.deadline),
            chatId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Emit socket event for real-time update
        const socket = io(import.meta.env.VITE_API_URL);
        socket.emit("project-created", {
          chatId,
          projectData: {
            ...data.project,
            clientId: projectData.clientId,
            freelancerId: projectData.freelancerId,
          },
        });

        onClose();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectData.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            status: "approved",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve project");
      }

      // Send socket notification
      const socket = io(import.meta.env.VITE_API_URL);
      socket.emit("project-status-update", {
        chatId,
        projectId: projectData.id,
        status: "approved",
      });

      onClose();
    } catch (error) {
      console.error("Error approving project:", error);
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectData.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            status: "rejected",
          }),
        }
      );

      if (response.ok) {
        // Emit socket event for real-time update
        const socket = io(import.meta.env.VITE_API_URL);
        socket.emit("project-status-updated", {
          chatId,
          projectId: projectData.id,
          status: "rejected",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error rejecting project:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="project-modal-overlay">
      <div className="project-modal">
        <div className="project-modal-header">
          <h2>
            {isClientView ? "Project Details" : "Create Project Agreement"}
          </h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="project-modal-content">
          {isClientView ? (
            <div className="project-details">
              <div className="project-detail">
                <label>Title:</label>
                <p>{projectData.title}</p>
              </div>
              <div className="project-detail">
                <label>Description:</label>
                <p>{projectData.description}</p>
              </div>
              <div className="project-detail">
                <label>Budget:</label>
                <p>${projectData.budget}</p>
              </div>
              <div className="project-detail">
                <label>Deadline:</label>
                <p>{projectData.deadline} days</p>
              </div>
              <div className="project-detail">
                <label>Category:</label>
                <p>{projectData.category}</p>
              </div>
              <div className="project-detail">
                <label>Requirements:</label>
                <ul>
                  {projectData.requirements?.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              <div className="project-actions">
                <button className="approve-button" onClick={handleApprove}>
                  Approve Project
                </button>
                <button className="reject-button" onClick={handleReject}>
                  Reject Project
                </button>
              </div>
            </div>
          ) : (
            // Freelancer View - Show Project Creation Form
            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Budget ($):</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Deadline (days):</label>
                <input
                  type="number"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Category:</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Requirements (comma-separated):</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="e.g., Responsive design, SEO optimization, Mobile-friendly"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Create Project
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
