import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export interface Voter {
  user_id: string;
  username: string | null;
  full_name: string | null;
}

const fetchPollVoters = async (pollId: string): Promise<Voter[]> => {
  // Step 1: Fetch all votes for the poll to get the user IDs
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('user_id')
    .eq('poll_id', pollId);

  if (votesError) {
    console.error('Error fetching votes for voters:', votesError);
    showError('Failed to load voter list.');
    throw new Error(votesError.message);
  }

  if (!votes || votes.length === 0) {
    return []; // No voters yet, return an empty array.
  }

  // Step 2: Extract the unique user IDs from the votes, filtering out any nulls
  const userIds = [...new Set(votes.map((vote) => vote.user_id).filter(id => id))] as string[];
  if (userIds.length === 0) {
    return [];
  }

  // Step 3: Fetch the profiles for those unique user IDs
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error fetching voter profiles:', profilesError);
    showError('Failed to load voter list.');
    throw new Error(profilesError.message);
  }

  // Step 4: Combine the data and return it
  return profiles?.map(profile => ({
    user_id: profile.id,
    username: profile.username,
    full_name: profile.full_name,
  })) || [];
};

export const usePollVoters = (pollId: string, enabled: boolean = true) => {
  return useQuery<Voter[], Error>({
    queryKey: ['pollVoters', pollId],
    queryFn: () => fetchPollVoters(pollId),
    enabled: !!pollId && enabled,
  });
};