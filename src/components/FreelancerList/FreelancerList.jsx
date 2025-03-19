import React, { useEffect, useState } from "react";
import "./FreelancerList.css";

export default function FreelancerList() {
  const [loading, setLoading] = useState(false);
  const [freelancers, setFreelancers] = useState([]);
  
  // Fetch freelancers from the API
  const getFreelancers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/freelancers`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setFreelancers(data.freelancers);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getFreelancers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="overlord">
        <table className="table-container">
          <tbody>
            <tr className="table-heading">
              <th className="t-heading">Name</th>
              <th className="t-heading">Position</th>
              <th className="t-heading">Phone</th>
              <th className="t-heading">Email</th>
              <th className="t-heading">Status</th>
            </tr>
            {freelancers.map((freelancer) => (
              <tr key={freelancer.id}>
                <td className="t-data">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <img
                      src={freelancer.profilePicture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                      alt="User Profile"
                      className="user-profile"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                    />
                    {freelancer.name}
                  </div>
                </td>
                
                <td className="t-data">{freelancer.jobTitle || 'N/A'}</td>
                <td className="t-data">{freelancer.phone || 'N/A'}</td>
                <td className="t-data">{freelancer.email}</td>
                <td className="t-data">
                  <div className="action-buttons">
                    <div className="active-blocked">
                      {freelancer.activeStatus ? 'active' : 'inactive'}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
