import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// A simplified profile type just for this check
interface ProfileCheck {
  full_name: string | null;
}

const fetchProfileForCheck = async (userId: string): Promise<ProfileCheck | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single();
  // PGRST116 means no rows found, which is a valid state before profile creation
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { session, isLoading: isSessionLoading } = useSupabaseSession();
  const location = useLocation();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profileCheck', session?.user?.id],
    queryFn: () => fetchProfileForCheck(session!.user.id),
    enabled: !!session?.user,
  });

  const isLoading = isSessionLoading || (!!session && isProfileLoading);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading application...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to profile page if full_name is not set and the user is not already on the profile page
  const isProfileIncomplete = profile && !profile.full_name;
  if (isProfileIncomplete && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;