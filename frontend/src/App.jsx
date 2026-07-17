import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthGateway from './pages/AuthGateway';
import CandidateDashboard from './pages/CandidateDashboard'; // Create this simple dashboard shell next
import RecruiterDashboard from './pages/RecruiterDashboard';   // Create this simple dashboard shell next

// Helper utility to safely extract payload parameters from the storage JWT token
const getRoleFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload).role; // Reads the "role" parameter you configured in your FastAPI token payload
  } catch (e) {
    console.error("Invalid local security token string format context:", e);
    return null;
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(getRoleFromToken());

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setUserRole(getRoleFromToken());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <Routes>
        {/* Authentication Gateway view endpoint redirection */}
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? (
              userRole === 'recruiter' ? <Navigate to="/recruiter/dashboard" replace /> : <Navigate to="/candidate/dashboard" replace />
            ) : (
              <AuthGateway onAuthSuccess={handleAuthSuccess} />
            )
          } 
        />

        {/* Candidate Secured Route Space */}
        <Route 
          path="/candidate/dashboard" 
          element={
            isAuthenticated && userRole === 'candidate' ? (
              <CandidateDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />

        {/* Recruiter Secured Route Space */}
        <Route 
          path="/recruiter/dashboard" 
          element={
            isAuthenticated && userRole === 'recruiter' ? (
              <RecruiterDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />

        {/* Catch-all global fallback parameter */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}