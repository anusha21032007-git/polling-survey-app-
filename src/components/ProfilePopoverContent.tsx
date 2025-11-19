import React from 'react';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { useProfile } from '@/hooks/use-profile';
import ProfileForm, { ProfileFormValues } from '@/components/ProfileForm';
import { showSuccess, showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface ProfilePopoverContentProps {
  onClose: () => void;
}

const ProfilePopoverContent: React.FC<ProfilePopoverContentProps> = ({ onClose }) => {
  const { user } = useSupabaseSession();
  const { profile, isLoading, isError, updateProfile, isUpdating } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      const { email, ...profileData } = data;
      await updateProfile(profileData);
      showSuccess('Profile updated successfully!');
      onClose(); // Close popover on success
    } catch (error) {
      showError((error as Error).message);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      // Log the error for debugging purposes, but don't block the user from logging out.
      // Errors like 403 or AuthSessionMissingError can occur if the session is already invalid,
      // but the client-side cleanup should still proceed.
      console.error('Sign out error:', error.message);
    }

    // Always clear the local cache and redirect to the login page.
    queryClient.clear();
    navigate('/login');
  };

  return (
    <div className="p-2">
      <div className="flex items-center mb-2">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">Edit Profile</h3>
      </div>
      <Separator className="mb-4" />
      
      {isLoading ? (
        <div className="space-y-4 p-4">
          <div className="flex justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : isError || !profile || !user?.email ? (
        <div className="text-destructive p-4 text-center">Error loading profile.</div>
      ) : (
        <ProfileForm
          profile={profile}
          email={user.email}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
          onCancel={onClose}
        />
      )}
      
      <Separator className="my-4" />
      
      <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};

export default ProfilePopoverContent;