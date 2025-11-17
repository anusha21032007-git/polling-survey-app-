import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { useProfile } from '@/hooks/use-profile';
import ProfileForm, { ProfileFormValues } from '@/components/ProfileForm';
import { showSuccess, showError } from '@/utils/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ isOpen, onOpenChange }) => {
  const { user } = useSupabaseSession();
  const { profile, isLoading, isError, updateProfile, isUpdating } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      const { email, ...profileData } = data;
      await updateProfile(profileData);
      showSuccess('Profile updated successfully!');
      handleOpenChange(false); // Close dialog on success
    } catch (error) {
      showError((error as Error).message);
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    // If the dialog is being closed and we are on the dedicated profile route, navigate home.
    if (!open && location.pathname === '/profile') {
      navigate('/');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
          {!isLoading && profile && !profile.full_name && (
            <DialogDescription className="text-destructive">
              Please complete your profile before continuing.
            </DialogDescription>
          )}
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError || !profile || !user?.email ? (
          <div className="text-destructive p-4">Error loading profile. Please try again.</div>
        ) : (
          <ProfileForm
            profile={profile}
            email={user.email}
            onSubmit={handleSubmit}
            isSubmitting={isUpdating}
            onCancel={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;