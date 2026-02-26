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
import ProviderDashboard from "./pages/providers/ProviderDashboard";
import ProviderProfilePage from "./pages/providers/ProviderProfilePage";
import ProviderAvailabilityPage from "./pages/providers/ProviderAvailabilityPage";
import ServiceDetail from "./pages/users/ServiceDetail";
import FavoritesPage from "./pages/users/FavoritesPage";
import BookingsPage from "./pages/users/BookingsPage";
import ClientProfilePage from "./pages/users/ClientProfilePage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');
  const isAuthenticated = token && token !== 'undefined' && token !== 'null';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If they have a token but wrong role, send them to their respectful dashboard
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');
  const isAuthenticated = token && token !== 'undefined' && token !== 'null';

  if (isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

function App() {
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['client', 'provider']}>
              {role === 'provider' ? <ProviderDashboard /> : <ClientDashboard />}
            </ProtectedRoute>
          }
        />

        {/* Provider-only extra pages */}
        <Route
          path="/provider/profile"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/availability"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderAvailabilityPage />
            </ProtectedRoute>
          }
        />

        {/* Shared Authenticated Pages */}
        <Route
          path="/services/:serviceId"
          element={
            <ProtectedRoute allowedRoles={['client', 'provider']}>
              <ServiceDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute allowedRoles={['client', 'provider']}>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={['client', 'provider']}>
              <BookingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['client', 'provider']}>
              <ClientProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Root Redirect */}
        <Route path="/" element={
          <Navigate to="/dashboard" replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;