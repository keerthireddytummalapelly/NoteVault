import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Check if token exists
  if (!token) {
    return <Navigate to="/login" />; // Redirect to login if token is missing
  }
  return children; // Render the child components if token exists
};

export default ProtectedRoute;