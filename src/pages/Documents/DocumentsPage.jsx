import React, { useEffect, useState } from "react";
import "./DocumentsPage.css";
import Navbar from "../../components/common/NavBar/NavBar";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import DocumentHeader from "../../components/DocumentHeader/DocumentHeader";
import DocumentsList from "../../components/DocumentsList/DocumentsList";

const DocumentsPage = () => {
  const [loading, setLoading] = useState(false);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const token = localStorage.getItem("token");
  const url = import.meta.env.VITE_API_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

 

  const handleSearch = (query) => {
    if (!query) {
      setFilteredDocuments(documents);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      setFilteredDocuments(
        documents.filter((document) =>
          document.name.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="DocumentsPage">
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <Navbar />
        <div className="DocumentsPageContainer">
          <SearchBar placeholder="Search" onSearch={handleSearch} />
          <DocumentHeader />
          <DocumentsList />
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;