// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  setPersistence,
  inMemoryPersistence,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const auth = getAuth(app);
await setPersistence(auth, inMemoryPersistence);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const messaging = getMessaging(app);

const requestForToken = () => {
  return Notification.requestPermission()
    .then((permission) => {
      if (permission === "granted") {
        return getToken(messaging, {
          vapidKey: import.meta.env.VITE_API_VAPID_KEY,
        });
      } else {
        throw new Error("Notification not granted");
      }
    })
    .catch((err) => {
      console.error("Error getting token", err);
    });
};
onMessage(messaging, ({ notification }) => {
  new Notification(notification.title, {
    body: notification.body,
    icon: notification.icon,
  });
});
const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("payload", payload);
      resolve(payload);
    });
  });
// Add logout function
const handleLogout = async () => {
  try {
    await signOut(auth);
    // Clear all authentication-related items from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("uid");
    localStorage.removeItem("role");
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
};

export {
  auth,
  db,
  storage,
  googleProvider,
  requestForToken,
  onMessageListener,
  handleLogout,
};
