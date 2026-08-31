import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCL7GTkRwoD0oVdbcyYSpv28kOxqFRTJwU",
  authDomain: "bizmonitor-3d2d8.firebaseapp.com",
  projectId: "bizmonitor-3d2d8",
  storageBucket: "bizmonitor-3d2d8.firebasestorage.app",
  messagingSenderId: "831951721942",
  appId: "1:831951721942:web:7980b09c8f357e72158077",
  measurementId: "G-L4WEF8Z3TH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
