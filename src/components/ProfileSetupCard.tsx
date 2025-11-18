import React from 'react';
import { useProfile } from '@/hooks/use-profile';
import ProfileForm, { ProfileFormValues } from '@/components/ProfileForm';
import { showSuccess, showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { useNavigate } from 'react-router-dom';

interface ProfileSetupCardProps {
  onSetupComplete: () => void;
}

const ProfileSetupCard: React.FC<ProfileSetupCardProps> = ({ onSetupComplete }) => {
  const { user } = useSupabaseSession();
  const { profile, isLoading, isError, updateProfile, isUpdating } = useProfile();
  const navigate = useNavigate();

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      const { email, ...profileData } = data;
      await updateProfile(profileData);
      showSuccess('Profile setup complete! Welcome.');
      onSetupComplete();
      navigate('/'); // Redirect to home after successful setup
    } catch (error) {
      showError((error as Error).message);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex justify-center"><Skeleton className="h-24 w-24 rounded-full" /></div>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !profile || !user?.email) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader><CardTitle>Profile Setup</CardTitle></CardHeader>
        <CardContent className="text-destructive p-6 text-center">
          Error loading profile data. Please try logging in again.
        </CardContent>
      </Card>
    );
  }

  // If profile is already complete, redirect away (should be caught by ProtectedRoute, but good fallback)
  if (profile.full_name) {
    onSetupComplete();
    return null;
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome! Setup Your Profile</CardTitle>
        <CardDescription>
          Please complete your profile details to continue using the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm
          profile={profile}
          email={user.email}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
          // Onboarding requires completion, so no cancel button
          onCancel={() => {}} 
          hideCancel={true}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileSetupCard;