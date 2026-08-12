import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdminUser } from '../utils/auth';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading text="Verifying administrator session..." />
      </div>
    );
  }

  if (!isAuthenticated || !isAdminUser(user)) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
