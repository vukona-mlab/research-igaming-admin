import React, { useState } from "react";
import { requestForToken, onMessageListener } from "../../../config/firebase";

const NotifsLogic = () => {
  const [notifications, setNotifications] = useState([{ title: "", body: "" }]);

  requestForToken();

  //   onMessageListener()
  //     .then((payload) => {
  //       console.log({ payload });
  //       setNotifications((prev) => [
  //         ...prev,
  //         {
  //           title: payload?.notification?.title,
  //           body: payload?.notification?.body,
  //         },
  //       ]);
  //     })
  //     .catch((err) => console.log("failed: ", err));

  return (
    <div className="NotifsLogic">
      {notifications && notifications.length > 0 ? (
        notifications.map((notif, i) => (
          <div key={i}>
            <p>{notif.title}</p>
            <p>{notif.body}</p>
          </div>
        ))
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default NotifsLogic;
