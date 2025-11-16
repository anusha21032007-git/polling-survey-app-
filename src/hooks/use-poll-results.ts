import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface VoteCount {
  option_id: string;
  count: number;
}

const fetchPollResults = async (pollId: string): Promise<VoteCount[]> => {
  // Fetch all votes for the given poll ID
  const { data, error } = await supabase
    .from('votes')
    .select('option_id')
    .eq('poll_id', pollId);

  if (error) {
    console.error('Error fetching poll results:', error);
    showError('Failed to load poll results.');
    throw new Error(error.message);
  }

  // Aggregate votes by option_id
  const voteCountsMap = data.reduce((acc, vote) => {
    const optionId = vote.option_id;
    acc.set(optionId, (acc.get(optionId) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  // Convert map to array of VoteCount objects
  const results: VoteCount[] = Array.from(voteCountsMap, ([option_id, count]) => ({
    option_id,
    count,
  }));

  return results;
};

export const usePollResults = (pollId: string) => {
  return useQuery<VoteCount[], Error>({
    queryKey: ['pollResults', pollId],
    queryFn: () => fetchPollResults(pollId),
    enabled: !!pollId,
  });
};