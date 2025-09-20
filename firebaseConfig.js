// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXd-E_aBnMwerpvU8V-OYR7-jJ9N2LfJ0",
  authDomain: "studyscout-a8343.firebaseapp.com",
  projectId: "studyscout-a8343",
  storageBucket: "studyscout-a8343.firebasestorage.app",
  messagingSenderId: "388650542735",
  appId: "1:388650542735:web:d74e1889b9e681cee032fa",
  measurementId: "G-DFRDYZWE7G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the services you want to use
export const db = getFirestore(app);
export const functions = getFunctions(app);