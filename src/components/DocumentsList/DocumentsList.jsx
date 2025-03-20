import React from "react";
import './documentsList.css';

export default function DocumentsList() {
  const data = [
    {
      name: "Oscar Poco",
      status: "Pending",
      type: "Identity Card",
      email: "rea@gmail.com",
      date: "18-03-2025",
      document: "OscarPocoID.pdf",
      actions: "Approved",
    },
  ];
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
          {data.map((item)=>(
          <tr key={item.id}>
          <td className="t-data">{item.name}</td>
          <td className="t-data">{item.status}</td>
          <td className="t-data">{item.type}</td>
          <td className="t-data">{item.email}</td>
          <td className="t-data">{item.date}</td>
          <td className="t-data">{item.document}</td>
          <td className="t-data"><div className="action-buttons">
            <div className="approved">{item.actions}</div>
            </div></td>
        </tr>
       ))}
        </tbody>
      </table>
    </div>
  );
}
