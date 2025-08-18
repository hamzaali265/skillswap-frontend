import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('PublicRoute - isAuthenticated:', isAuthenticated, 'loading:', loading);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
