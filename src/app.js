// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./components/ProfilePage";
import Sidebar from "./components/Sidebar";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import "./app.css";
import Layout from "./components/Layout";
import StorageTab from "./components/StorageTab";
import SettingsTab from "./components/SettingsTab";
import EmailVerified from './components/EmailVerified';
import AboutUs from "./pages/AboutUs";
import ContactPage from "./pages/ContactPage";
import PricingPage from "./pages/PricingPage";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // To handle initial loading state

  const auth = getAuth();

  // Monitor Auth State
  // In App.js's useEffect
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => { // Add user parameter
    if (user && user.emailVerified) { // Add email verification check
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  });
  return () => unsubscribe();
}, [auth]);
  // Handle Logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.error("Logout error:", error.message);
      });
  };

  if (isLoading) {
    // Show a loading indicator or splash screen while auth state is being checked
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/signup" element={<Signup />} />
        <Route
  path="/login"
  element={
    isLoggedIn ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <Login setIsLoggedIn={setIsLoggedIn} />
    )
  }
/>

        {/* Protected Routes */}
        {isLoggedIn ? (
          <Route element={<Layout onLogout={handleLogout} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/storage" element={<StorageTab />} />
            <Route path="/setting" element={<SettingsTab />} />
          </Route>
        ) : (
          // Redirect to login if not logged in
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </div>
  );
}


export default App;
