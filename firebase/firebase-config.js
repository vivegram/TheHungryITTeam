// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIcw51ALaGCE-_upR-Qgck_PvnZrwPp5Q",
  authDomain: "thehungryitteam.firebaseapp.com",
  databaseURL: "https://thehungryitteam-default-rtdb.firebaseio.com",
  projectId: "thehungryitteam",
  storageBucket: "thehungryitteam.firebasestorage.app",
  messagingSenderId: "961131812914",
  appId: "1:961131812914:web:875b86903c88a80f3d042b",
  measurementId: "G-7E8TNC5TPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
