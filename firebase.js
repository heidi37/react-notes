// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//Access to DB in Cloud Firestore
import { getFirestore, collection } from "firebase/firestore";

// Your web app's Firebase configuration
// Configuration object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "react-notes-99c00.firebaseapp.com",
  projectId: "react-notes-99c00",
  storageBucket: "react-notes-99c00.appspot.com",
  messagingSenderId: "966263982251",
  appId: "1:966263982251:web:5b7ab976cd84aa192c8fee"
};

// Initialize Firebase
// Give access to application as it lives in Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const notesCollection = collection(db, "notes")
