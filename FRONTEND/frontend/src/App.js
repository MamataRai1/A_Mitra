import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClientDashboard from "./pages/users/ClientDashboard";
import ServiceDetail from "./pages/users/ServiceDetail";
import FavoritesPage from "./pages/users/FavoritesPage";
import BookingsPage from "./pages/users/BookingsPage";

function App() {
  // Pulling these inside the render ensures we check them on every route change
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');
  const isAuthenticated = !!token;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <LoginPage /> : (role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)
        } />
        
        <Route path="/register" element={
          !isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />
        } />

        <Route path="/admin" element={
          isAuthenticated && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
        } />

        <Route path="/dashboard" element={
          isAuthenticated 
            ? (role === 'admin' ? <Navigate to="/admin" /> : <ClientDashboard />) 
            : <Navigate to="/login" />
        } />

        <Route
          path="/services/:serviceId"
          element={
            isAuthenticated
              ? (role === "admin" ? <Navigate to="/admin" /> : <ServiceDetail />)
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/favorites"
          element={
            isAuthenticated
              ? (role === "admin" ? <Navigate to="/admin" /> : <FavoritesPage />)
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/bookings"
          element={
            isAuthenticated
              ? (role === "admin" ? <Navigate to="/admin" /> : <BookingsPage />)
              : <Navigate to="/login" />
          }
        />

        {/* Root Redirect */}
        <Route path="/" element={
          <Navigate to={!isAuthenticated ? "/login" : (role === 'admin' ? "/admin" : "/dashboard")} />
        } />
      </Routes>
    </Router>
  );
}

export default App;