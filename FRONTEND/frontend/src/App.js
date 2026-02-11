import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Correct Imports
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// A simple dashboard component so your app doesn't crash if you don't have one yet
const ClientDashboard = () => <h1 style={{textAlign:'center', marginTop:'50px'}}>Welcome to the Dashboard!</h1>;

function App() {
  // Check if token exists in localStorage to decide if user is authenticated
  const isAuthenticated = !!localStorage.getItem('token'); 

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <ClientDashboard /> : <Navigate to="/login" />}
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;