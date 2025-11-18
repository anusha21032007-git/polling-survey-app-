import React from 'react';
import ProfileSetupCard from '@/components/ProfileSetupCard';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const SetupProfile: React.FC = () => {
  const { session, isLoading: isSessionLoading } = useSupabaseSession();
  const queryClient = useQueryClient();

  if (isSessionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Function called when setup is successfully completed
  const handleSetupComplete = () => {
    // Invalidate the profile check query so ProtectedRoute re-evaluates and allows navigation
    queryClient.invalidateQueries({ queryKey: ['profileCheck', session.user.id] });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <ProfileSetupCard onSetupComplete={handleSetupComplete} />
    </div>
  );
};

export default SetupProfile;