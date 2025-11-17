import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { useProfile } from '@/hooks/use-profile';
import ProfileForm, { ProfileFormValues } from '@/components/ProfileForm';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const Profile: React.FC = () => {
  const { user } = useSupabaseSession();
  const { profile, isLoading, isError, updateProfile, isUpdating } = useProfile();
  const navigate = useNavigate();

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      // Remove email from data sent to backend, as it's not in the profiles table
      const { email, ...profileData } = data;
      await updateProfile(profileData);
      showSuccess('Profile updated successfully!');
      navigate('/');
    } catch (error) {
      showError((error as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !profile || !user?.email) {
    return <div className="max-w-2xl mx-auto text-destructive p-4">Error loading profile. Please try refreshing the page.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Profile</CardTitle>
          {!profile.full_name && (
             <CardDescription className="text-destructive">
               Please complete your profile before continuing.
             </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ProfileForm
            profile={profile}
            email={user.email}
            onSubmit={handleSubmit}
            isSubmitting={isUpdating}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;