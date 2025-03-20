import React, { useEffect, useState } from "react";
import axios from 'axios';
import "./FreelancerList.css";
import ProfileCard from '../../components/Profilecard/ProfileCard';

export default function FreelancerList() {
  const [loading, setLoading] = useState(false);
  const [freelancers, setFreelancers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/freelancers');
      console.log('Fetched freelancers:', response.data.freelancers);
      setFreelancers(response.data.freelancers);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (freelancer) => {
    setSelectedFreelancer(freelancer);
  };

  const handleCloseProfile = () => {
    setSelectedFreelancer(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="freelancer-container">
        {selectedFreelancer && (
          <ProfileCard
            fullName={selectedFreelancer.name}
            roles={selectedFreelancer.roles}
            email={selectedFreelancer.email}
            phone={selectedFreelancer.phone}
            dateOfBirth={selectedFreelancer.dateOfBirth}
            interests={selectedFreelancer.interests || 'Not specified'}
            projectCount={selectedFreelancer.projectCount || 0}
            profileImage={selectedFreelancer.profilePicture}
            onClose={handleCloseProfile}
          />
        )}
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
                            cursor: "pointer"
                          }}
                          onClick={() => handleProfileClick(freelancer)}
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