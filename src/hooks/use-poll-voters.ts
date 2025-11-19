import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export interface Voter {
  user_id: string;
  username: string | null;
  full_name: string | null;
}

const fetchPollVoters = async (pollId: string): Promise<Voter[]> => {
  // This query now works because of the new foreign key relationship.
  // It fetches votes and joins the related profile in a single request.
  const { data, error } = await supabase
    .from('votes')
    .select('user_id, profiles(username, full_name)')
    .eq('poll_id', pollId);

  if (error) {
    console.error('Error fetching poll voters:', error);
    showError('Failed to load voter list.');
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  // The data returns duplicates if a user voted multiple times (in a multiple-choice poll).
  // We need to create a unique list of voters.
  const uniqueVoters = new Map<string, Voter>();

  data.forEach(vote => {
    // The 'profiles' property can be an array or an object. We handle the object case.
    const profile = Array.isArray(vote.profiles) ? vote.profiles[0] : vote.profiles;
    
    if (vote.user_id && !uniqueVoters.has(vote.user_id)) {
      uniqueVoters.set(vote.user_id, {
        user_id: vote.user_id,
        username: profile?.username || null,
        full_name: profile?.full_name || null,
      });
    }
  });

  return Array.from(uniqueVoters.values());
};

export const usePollVoters = (pollId: string, enabled: boolean = true) => {
  return useQuery<Voter[], Error>({
    queryKey: ['pollVoters', pollId],
    queryFn: () => fetchPollVoters(pollId),
    enabled: !!pollId && enabled,
  });
};