import React, { useState, useRef, useEffect, act } from "react";
import "./documentsList.css";
import axios, { all } from "axios";
import { FaEllipsisV } from "react-icons/fa";

export default function DocumentsList() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentDocId, setCurrentDocId] = useState("");
  const contextMenuRef = useRef(null);
  useEffect(() => {
    getDocuments();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      console.log("Token:", token);

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/documents`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      const arr = response.data.usersDocuments.map((user) => {
        let docs = user.documents.filter((doc) => doc.id);

        if (docs && docs.length > 0) {
          docs = docs.map((doc) => {
            return { ...doc, userId: user.id, email: user.email };
          });
          return docs;
        }
        return [];
      });
      console.log("Fetched documents:", arr.flat());

      const allDocuments = arr.flat();

      setDocuments(allDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContextMenuClick = (e) => {
    e.stopPropagation();

    setShowContextMenu(!showContextMenu);
  };
  const handleContextMenuAction = async (action, docId, userId) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("authToken"); // Get the token which already includes 'Bearer' prefix
      const status = action === "approve" ? "approved" : "declined";
      console.log({
        userId,
        docId: docId,
        status,
      });
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/documents/${userId}/update-status`,
        {
          docId: docId,
          status,
        },
        {
          headers: {
            Authorization: token, // Use the token directly as it already includes 'Bearer'
            "Content-Type": "application/json",
          },
        }
      );
      getDocuments();
      // Call the parent component's callback to update the UI
      setShowContextMenu(false);
    } catch (error) {
      console.error("Error updating document status:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container">
      <table className="table-container">
        <tbody>
          <tr className="heading-container">
            <th className="table-heading">Name</th>
            <th className="table-heading">Status</th>
            <th className="table-heading">Document type</th>
            <th className="table-heading">User's Email</th>
            <th className="table-heading">Date Uploaded</th>
            <th className="table-heading">Document</th>
            <th className="table-heading">Actions</th>
          </tr>
          {documents.map((document) => (
            <tr key={document.id}>
              <td className="t-data">{document.documentName || "N/A"}</td>
              <td className="t-data">{document.status || "N/A"}</td>
              <td className="t-data">{document.documentType || "N/A"}</td>
              <td className="t-data">{document.email || "N/A"}</td>
              <td className="t-data">{document.dateAdded || "N/A"}</td>
              <td className="t-data">{document.documentName || "N/A"}</td>
              <td className="t-data">
                <div className="action-buttons">
                  {/* <div className="approved">{document.actions}Approved</div> */}
                  <div className="context-menu-container">
                    <div
                      className="dotted-menu"
                      disabled={isUpdating || document.status == "approved"}
                      onClick={(e) => {
                        if (document.status != "approved") {
                          setCurrentDocId(document.id);
                          handleContextMenuClick(e);
                        }
                      }}
                      aria-label="More options"
                    >
                      <FaEllipsisV />
                    </div>
                    {showContextMenu && currentDocId == document.id && (
                      <div className="context-menu">
                        <button
                          className="context-menu-item approve"
                          onClick={() =>
                            handleContextMenuAction(
                              "approve",
                              document.id,
                              document.userId
                            )
                          }
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Updating..." : "Approve"}
                        </button>
                        <button
                          className="context-menu-item decline"
                          onClick={() =>
                            handleContextMenuAction(
                              "decline",
                              document.id,
                              document.userId
                            )
                          }
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Updating..." : "Decline"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
