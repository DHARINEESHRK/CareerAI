import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAWUd5dIBhhg9abkix7dJq3QrQexoBEFeY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "careerai-14ea0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "careerai-14ea0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "careerai-14ea0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "105364413991",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:105364413991:web:d19fd647243b3a0fb3b802",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZYJ5G1P627"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally (only in supported browser environments)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, googleProvider, analytics };
export default app;
