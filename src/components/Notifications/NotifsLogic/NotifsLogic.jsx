import React, { useState, useEffect } from "react";
import { requestForToken } from "../../../config/firebase";
import toast, { Toaster } from "react-hot-toast";

const NotifsLogic = () => {
  const [token, setToken] = useState("");
  useEffect(() => {
    const getToken = async () => {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await requestForToken();
        if (token) {
          setToken(token);
        }
      }
    };

    getToken();
  }, []);

  return (
    <div className="App">
      <h1>Push Notification with React & FCM</h1>
      <p>{token} </p>
      {token && <h2>Notification permission enabled</h2>}
      {!token && <h2>Need notification permission </h2>}
    </div>
  );
};

export default NotifsLogic;
