import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectDetails.css";
import { io } from "socket.io-client";
import PaystackPop from "@paystack/inline-js";
import TermsModal from "../../Escrow/TermsModal";

const ProjectDetails = ({ project, onClose, isClient }) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const [clientId, setClientId] = useState(project?.clientId || null);
  const [freelancerId, setFreelancerId] = useState(
    project?.freelancerId || null
  );
  const [clientDetails, setClientDetails] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [freelancerDetails, setFreelancerDetails] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (project) {
      setClientId(project.clientId);
      setFreelancerId(project.freelancerId);
      fetchUserDetails();
    }
  }, [project]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch client details using the correct endpoint
      const clientResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/users/${project.clientId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      const clientData = await clientResponse.json();
      setClientDetails(clientData.user);

      // Fetch freelancer details if available
      if (project.freelancerId) {
        const freelancerResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/users/${
            project.freelancerId
          }`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        const freelancerData = await freelancerResponse.json();
        setFreelancerDetails(freelancerData.user);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleProjectAction = async (action) => {
    try {
      const token = localStorage.getItem("token");

      if (action === "reject" || action === "delete") {
        // Delete the project if rejected by client or deleted by freelancer
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/projects/${project.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: token,
            },
          }
        );

        if (response.ok) {
          // Emit socket event for project deletion/rejection
          const socket = io(import.meta.env.VITE_API_URL);
          socket.emit("project-status-updated", {
            chatId: project.chatId,
            projectId: project.id,
            status: action === "reject" ? "rejected" : "deleted",
            message:
              action === "reject"
                ? "Project has been rejected"
                : "Project has been deleted",
          });
          onClose();
        }
      } else if (action === "approve") {
        // Update project status to approved
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/projects/${project.id}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({ status: "approved" }),
          }
        );

        if (response.ok) {
          await handleTransaction();
          // Emit socket event for project approval
          const socket = io(import.meta.env.VITE_API_URL);
          socket.emit("project-status-updated", {
            chatId: project.chatId,
            projectId: project.id,
            status: "approved",
            message: "Project has been approved",
          });
          onClose();
        }
      }
    } catch (error) {
      console.error("Error handling project action:", error);
    }
  };

  const handleTransaction = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          clientId: clientId,
          freelancerId: freelancerId,
          amount: parseFloat(project.budget),
          clientEmail: clientDetails.email,
          projectId: project.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const popup = new PaystackPop();

        popup.resumeTransaction(data.accessCode, {
          onSuccess: async (transaction) => {
            console.log(transaction);
            if (transaction.status === "success") {
              try {
                const res = await fetch(
                  "http://localhost:8000/api/payment/verify",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: token,
                    },
                    body: JSON.stringify({
                      reference: transaction.reference,
                      clientId: clientId,
                      projectId: project.id,
                    }),
                  }
                );

                const verificationData = await res.json();
                if (res.ok) {
                  alert("Payment successful! Transaction has been verified.");
                  // Refresh the project details to show updated payment status
                  window.location.reload();
                } else {
                  alert(
                    `Payment verification failed: ${verificationData.error}`
                  );
                }
              } catch (verifyError) {
                alert("Error verifying payment. Please contact support.");
                console.error("Verification error:", verifyError);
              }
            }
          },

          onLoad: (response) => {
            console.log("onLoad: ", response);
          },

          onCancel: () => {
            alert("Transaction was cancelled");
          },

          onError: (error) => {
            alert(`Error during payment: ${error.message}`);
            console.error("Payment error:", error);
          },
        });
      } else {
        alert(`Failed to create transaction: ${data.error}`);
      }
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Error starting transaction. Please try again.");
    }
  };
  const handleReleaseFunds = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/transaction/release`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            clientId: clientId,
            freelancerId: freelancerId,
            transactionReference: project.payments[0].transactionId,
            projectId: project.id,
            clientApproval: true,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        window.location.reload();
      } else {
        if (data.needsBankAccount) {
          alert(
            "The freelancer needs to set up their bank account before funds can be released. Please ask them to update their payment details."
          );
        } else {
          alert(data.error || "Error releasing funds");
        }
      }
    } catch (error) {
      console.error("Release funds error:", error);
      alert("Error releasing funds. Please try again.");
    }
  };

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      if (project.payments && project.payments.length > 0) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/transaction/${
              project.payments[0].transactionId
            }/status?clientId=${clientId}`,
            {
              headers: {
                Authorization: token,
              },
            }
          );

          const data = await response.json();
          if (response.ok && data.status === "released") {
            // Update local state to reflect released status
            setProject((prev) => ({
              ...prev,
              paymentStatus: "released",
            }));
          }
        } catch (error) {
          console.error("Error fetching transaction status:", error);
        }
      }
    };

    fetchTransactionStatus();
  }, [project.payments, clientId, token]);

  console.log(project);
  return (
    <div className="project-details-modal-overlay">
      <div className="project-details-modal">
        <div className="project-details-header">
          <h2>Project Agreement</h2>
          <div className="header-actions">
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="project-details-content">
          <div className="detail-group">
            <h3>Basic Information</h3>
            <div className="detail-item">
              <span className="detail-label">Title:</span>
              <span className="detail-value">{project.title}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status ${project.status}`}>
                {project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Budget:</span>
              <span className="detail-value">R{project.budget}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{project.category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Deadline:</span>
              <span className="detail-value">{project.deadline} days</span>
            </div>
          </div>

          <div className="detail-group">
            <h3>Participants</h3>
            {clientDetails && (
              <div className="detail-item">
                <span className="detail-label">Client:</span>
                <span className="detail-value">
                  {clientDetails.displayName || clientDetails.email}
                </span>
              </div>
            )}
            {freelancerDetails && (
              <div className="detail-item">
                <span className="detail-label">Freelancer:</span>
                <span className="detail-value">
                  {freelancerDetails.displayName || freelancerDetails.email}
                </span>
              </div>
            )}
          </div>

          <div className="detail-group">
            <h3>Description</h3>
            <p className="project-description">{project.description}</p>
          </div>

          <div className="detail-group">
            <h3>Requirements</h3>
            <ul className="requirements-list">
              {project.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          <TermsModal
            show={showTermsModal}
            onHide={() => setShowTermsModal(false)}
            onAccept={setAcceptedTerms}
            accepted={acceptedTerms}
          />

          <div className="project-actions">
            {isClient && project.status === "pending" && (
              <>
                <button
                  className="approve-button"
                  onClick={() => handleProjectAction("approve")}
                >
                  Approve & Fund Project
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleProjectAction("reject")}
                >
                  Reject Project
                </button>
              </>
            )}
            {isClient && project.status === "approved" && (
              <div className="transaction-container">
                {!project.payments || project.payments.length === 0 ? (
                  <button
                    className="pay-now-button"
                    onClick={() => handleTransaction()}
                  >
                    Pay Now
                  </button>
                ) : (
                  <>
                    <div className="transaction-status">
                      <span className="status-label">Payment Status:</span>
                      <span className={`status-value ${project.paymentStatus}`}>
                        {project.paymentStatus.charAt(0).toUpperCase() +
                          project.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <button
                      className={`release-button ${
                        project.paymentStatus === "released" ? "released" : ""
                      }`}
                      onClick={() => handleReleaseFunds()}
                      disabled={project.paymentStatus === "released"}
                    >
                      {project.paymentStatus === "released"
                        ? "Funds Released"
                        : "Release funds"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
