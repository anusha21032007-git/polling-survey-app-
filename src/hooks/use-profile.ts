import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/integrations/supabase/session-context';

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  organization: string | null;
  receive_emails: boolean;
  updated_at: string;
}

const fetchProfile = async (): Promise<Profile | null> => {
  const { data, error } = await supabase.functions.invoke('profile', { method: 'GET' });
  if (error) throw new Error(error.message);
  return data;
};

const updateProfile = async (profileData: Partial<Omit<Profile, 'id' | 'updated_at'>>) => {
  const { data, error } = await supabase.functions.invoke('profile', {
    method: 'PUT',
    body: profileData,
  });
  
  if (error) throw new Error(error.message);
  // Handle application-level errors returned from the function
  if (data.error) throw new Error(data.error);
  
  return data;
};

export const useProfile = () => {
  const { user } = useSupabaseSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery<Profile | null, Error>({
    queryKey: ['profile', user?.id],
    queryFn: fetchProfile,
    enabled: !!user,
  });

  const mutation = useMutation<Profile, Error, Partial<Omit<Profile, 'id' | 'updated_at'>>>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update the cache with the new profile data
      queryClient.setQueryData(['profile', user?.id], data);
      // Invalidate the check query to allow navigation away from the profile page
      queryClient.invalidateQueries({ queryKey: ['profileCheck', user?.id] });
    },
  });

  return {
    profile,
    isLoading,
    isError,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};