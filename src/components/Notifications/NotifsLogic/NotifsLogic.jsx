import React, { useState, useEffect } from "react";
import { requestForToken, onMessageListener } from "../../../config/firebase";
import toast, { Toaster } from "react-hot-toast";

const NotifsLogic = () => {
  const [token, setToken] = useState("");
  const [notifications, setNotifications] = useState([]);
  const authToken = localStorage.getItem("authToken");
  useEffect(() => {
    const getNotifications = async () => {
      const response = await fetch(
        "http://localhost:8000/api/admin-notifications",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setNotifications(data.notifications);
      }
    };
    getNotifications();
  }, []);
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await requestForToken();
        setToken(token);
      } catch (error) {
        console.log(error);
      }
    };

    getToken();
  }, []);

  onMessageListener()
    .then((payload) => {
      console.log("recieved, payoload", payload);
      setNotifications((prev) => [
        ...prev,
        {
          title: payload?.notification?.title,
          body: payload?.notification?.body,
        },
      ]);
    })
    .catch((err) => console.log("failed: ", err));

  return <div className="NotifsLogic"></div>;
};

export default NotifsLogic;
