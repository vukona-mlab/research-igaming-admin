import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/signin/SignIn";
//import AdminDashboard from "./AdminDashboard";
import FreelancerList from "./components/FreelancerList/FreelancerList";
import DocumentsPage from "./pages/Documents/DocumentsPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/freelancer" element={<FreelancerList />} />
        <Route path="/documents" element={<DocumentsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
