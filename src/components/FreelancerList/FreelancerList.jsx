import React, { useEffect, useState } from "react";
import "./FreelancerList.css";

export default function FreelancerList() {
  const [loading, setLoading] = useState(false);
  const [freelancers, setFreelancers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/freelancers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch freelancers');
      }

      const data = await response.json();
      setFreelancers(data.freelancers);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="freelancer-container">
        <div className="overlord">
          <table className="table-container">
            <tbody>
              <tr className="table-heading">
                <th className="t-heading">Name</th>
                <th className="t-heading">Position</th>
                <th className="t-heading">Phone</th>
                <th className="t-heading">Email</th>
                <th className="t-heading">DOB</th>
                <th className="t-heading">Start date</th>
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
                      {freelancer.profilePicture && (
                        <img
                          src={freelancer.profilePicture}
                          alt="User"
                          className="user-profile"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                      {freelancer.name}
                      {freelancer.role}
                    </div>
                  </td>
                  <td className="t-data">{freelancer.position || 'N/A'}</td>
                  <td className="t-data">{freelancer.phone || 'N/A'}</td>
                  <td className="t-data">{freelancer.email}</td>
                  <td className="t-data">{freelancer.dateOfBirth || 'N/A'}</td>
                  <td className="t-data">{freelancer.startDate || 'N/A'}</td>
                  <td className="t-data">
                    <div className="action-buttons">
                      <div className={`active-blocked ${freelancer.status?.toLowerCase() || 'inactive'}`}>
                        {freelancer.status || 'inactive'}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
