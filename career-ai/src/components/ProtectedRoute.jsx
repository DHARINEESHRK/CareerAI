import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = () => {
  const isAuth = isAuthenticated();
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to complete profile if profile is NOT complete
  if (user?.isProfileComplete === false && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // Prevent accessing complete-profile if profile IS complete
  if (user?.isProfileComplete === true && location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard/path" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
