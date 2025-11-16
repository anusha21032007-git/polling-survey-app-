import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/integrations/supabase/session-context';

export type UserRole = 'user' | 'admin';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
}

const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error fetching user profile:', error);
    throw new Error(error.message);
  }

  return data as Profile | null;
};

export const useUserRole = () => {
  const { user, isLoading: isSessionLoading } = useSupabaseSession();
  
  const { data: profile, isLoading: isProfileLoading } = useQuery<Profile | null, Error>({
    queryKey: ['userProfile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user && !isSessionLoading,
  });

  // Default role to 'user' if profile hasn't loaded or role is missing
  const role: UserRole = profile?.role || 'user';
  const isAdmin = role === 'admin';
  const isRegularUser = role === 'user';

  return {
    profile,
    role,
    isAdmin,
    isRegularUser,
    isLoading: isSessionLoading || isProfileLoading,
  };
};