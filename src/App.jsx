import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/signin/SignIn";
//import AdminDashboard from "./AdminDashboard";
import FreelancerList from "./pages/FreelancerList/FreelanceList";
import DocumentsPage from "./pages/Documents/DocumentsPage";
import ProtectedRoutes from "./components/protected/ProtectedRoutes";
import ProtectedAuth from "./components/protected/ProtectedAuth";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import MessagesPage from "./pages/MessagingPage/MessagingPage";
import NotifsLogic from "./components/Notifications/NotifsLogic/NotifsLogic";
const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route element={<ProtectedAuth />}>
            <Route path="/" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route path="/freelancer" element={<FreelancerList />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifs" element={<NotifsLogic />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
