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

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
    console.error('Error fetching profile:', error);
    throw new Error(error.message);
  }
  return data;
};

const updateProfile = async ({ userId, profileData }: { userId: string, profileData: Partial<Omit<Profile, 'id' | 'updated_at'>> }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    if (error.code === '23505') { // Unique constraint violation (e.g., username)
      throw new Error('Username is already taken.');
    }
    throw new Error(error.message);
  }
  return data;
};

export const useProfile = () => {
  const { user } = useSupabaseSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery<Profile | null, Error>({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation<Profile, Error, Partial<Omit<Profile, 'id' | 'updated_at'>>>({
    mutationFn: (profileData) => updateProfile({ userId: user!.id, profileData }),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
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