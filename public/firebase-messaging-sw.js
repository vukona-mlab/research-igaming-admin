importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);
fetch("/firebase-config.json")
  .then((response) => {
    return response.json();
  })
  .then((jsContent) => {
    const config = eval(jsContent);
    firebase.initializeApp(config.firebaseConfig);
    const messaging = firebase.messaging();
    console.log(messaging);

    messaging.onBackgroundMessage(function (payload) {
      console.log("Received background message ", payload);

      // const notificationTitle = payload.notification.title;
      // const notificationOptions = {
      //   body: payload.notification.body,
      // };

      // self.registration.showNotification(
      //   notificationTitle,
      //   notificationOptions
      // );
    });
  })
  .catch((error) => {
    console.error("Error initializing Firebase in service worker:", error);
  });
