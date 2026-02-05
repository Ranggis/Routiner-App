// firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAQTje66qyAnpR4OAVNBOzg4mfPf7EbOFk",
  authDomain: "routiner-app-a4f42.firebaseapp.com",
  projectId: "routiner-app-a4f42",
  storageBucket: "routiner-app-a4f42.firebasestorage.app",
  messagingSenderId: "852459338607",
  appId: "1:852459338607:web:01862b458dec605746069a",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
