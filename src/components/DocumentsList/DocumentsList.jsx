import React, {useState, useEffect} from "react";
import './documentsList.css';
import axios from 'axios';

export default function DocumentsList() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
      getDocuments();
    }, []);

    const getDocuments = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/documents');
        console.log('Fetched documents:', response.data.usersDocuments);
    
        // Flatten documents into a single array
        const allDocuments = response.data.usersDocuments.flat();
        setDocuments(allDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
        setError(error.message);
      } finally {
        setLoading(false);
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
          {documents.map((document)=>(
          <tr key={document.id}>
          <td className="t-data">{document.name || 'N/A'}</td>
          <td className="t-data">{document.status || 'N/A'}</td>
          <td className="t-data">{document.type || 'N/A'}</td>
          <td className="t-data">{document.email || 'N/A'}</td>
          <td className="t-data">{document.date || 'N/A'}</td>
          <td className="t-data">{document.document || 'N/A'}</td>
          <td className="t-data"><div className="action-buttons">
            <div className="approved">{document.actions}</div>
            </div></td>
        </tr>
       ))}
        </tbody>
      </table>
    </div>
  );
}
