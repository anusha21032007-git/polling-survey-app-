import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export interface Voter {
  user_id: string;
  username: string | null;
  full_name: string | null;
}

const fetchPollVoters = async (pollId: string): Promise<Voter[]> => {
  // Fetch unique user_ids from votes table and join with profiles to get usernames/full names
  const { data, error } = await supabase
    .from('votes')
    .select('user_id, profiles(username, full_name)')
    .eq('poll_id', pollId)
    .limit(1000); // Limit to prevent massive data loads

  if (error) {
    console.error('Error fetching poll voters:', error);
    showError('Failed to load voter list.');
    throw new Error(error.message);
  }

  // Process data to extract unique voters and their profile info
  const uniqueVotersMap = new Map<string, Voter>();

  data.forEach((voteRecord: any) => {
    const userId = voteRecord.user_id;
    if (!uniqueVotersMap.has(userId)) {
      const profile = voteRecord.profiles;
      uniqueVotersMap.set(userId, {
        user_id: userId,
        username: profile?.username,
        full_name: profile?.full_name,
      });
    }
  });

  return Array.from(uniqueVotersMap.values());
};

export const usePollVoters = (pollId: string, enabled: boolean = true) => {
  return useQuery<Voter[], Error>({
    queryKey: ['pollVoters', pollId],
    queryFn: () => fetchPollVoters(pollId),
    enabled: !!pollId && enabled,
  });
};