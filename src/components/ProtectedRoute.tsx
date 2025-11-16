import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSupabaseSession } from '@/integrations/supabase/session-context';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useSupabaseSession();

  if (isLoading) {
    // You might want a better loading spinner here
    return <div className="min-h-screen flex items-center justify-center">Loading application...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;