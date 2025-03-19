import React, { useEffect, useState } from "react";
import "./FreelancerList.css";

export default function FreelancerList() {
  const [loading, setLoading] = useState(false);
  const [freelancerPicture, setFreelancerPicture] = useState("");

  const data = [
    {
      name: "Tiger Nixon",
      position: "Game Developer",
      phone: "060 683 1314",
      email: "rea@gmail.com",
      date: "18/03/2001",
      start: "18-03-2025",
    },
  ];

  const getProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(``, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setFreelancerPicture(data.user.freelancerPicture);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

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
              <th className="t-heading">DOB</th>
              <th className="t-heading">Start date</th>
            </tr>
            {data.map((item) => (
              <tr key={item.id}>
                <td className="t-data">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    {freelancerPicture !== "" ? (
                      <img
                        src={freelancerPicture}
                        alt="User"
                        className="user-profile"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          cursor: "pointer",
                        }}
                      />
                    ) : null}
                    {item.name}
                  </div>
                </td>
                <td className="t-data">{item.position}</td>
                <td className="t-data">{item.phone}</td>
                <td className="t-data">{item.email}</td>
                <td className="t-data">{item.date}</td>
                <td className="t-data">{item.start}</td>
                <td className="t-data">
                  <div className="action-buttons">
                    <div className="active-blocked">active</div>
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
