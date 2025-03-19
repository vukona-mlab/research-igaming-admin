import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/signin/SignIn";
//import AdminDashboard from "./AdminDashboard";
import ListHeader from "./components/common/ListHeader/ListHeader";
const App = () => {
  const [tab, setTab] = useState("");
  const [listName, setListName] = useState("Clients");

  return (
    <div>
      <ListHeader
        listName={listName}
        handleTabChange={setTab}
        handleListNameChange={setListName}
      />
    </div>
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<LoginPage />} />
    //   </Routes>
    // </Router>
  );
};

export default App;
