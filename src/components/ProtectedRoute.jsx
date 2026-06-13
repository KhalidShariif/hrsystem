import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Support both single role (string) and multiple roles (array)
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (allowedRoles && !roles.includes(user.role)) {
    // Redirect to their respective dashboard if they try to access a route they don't have access to
    const dashboard = user.role === 'admin' ? '/admin/dashboard' : (user.role === 'hr_manager' ? '/hr/employees' : '/employee/dashboard');
    return <Navigate to={dashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
