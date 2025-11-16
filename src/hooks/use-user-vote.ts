import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/integrations/supabase/session-context';

interface Vote {
  id: string;
  user_id: string;
  poll_id: string;
  option_id: string;
}

const fetchUserVotes = async (pollId: string, userId: string): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from('votes')
    .select('id, user_id, poll_id, option_id')
    .eq('poll_id', pollId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user votes:', error);
    throw new Error(error.message);
  }

  return data as Vote[];
};

export const useUserVote = (pollId: string) => {
  const { user, isLoading: isSessionLoading } = useSupabaseSession();
  
  return useQuery<Vote[], Error>({
    queryKey: ['userVotes', pollId, user?.id],
    queryFn: () => fetchUserVotes(pollId, user!.id),
    enabled: !!user && !isSessionLoading && !!pollId,
  });
};