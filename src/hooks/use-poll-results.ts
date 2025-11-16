import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface VoteRecord {
  option_id: string;
  user_id: string;
}

interface VoteCount {
  option_id: string;
  count: number;
}

export interface PollResultsData {
  voteCounts: VoteCount[];
  totalVotes: number;
  uniqueVoters: number;
}

const fetchPollResults = async (pollId: string): Promise<PollResultsData> => {
  // Fetch all votes for the given poll ID, including user_id
  const { data, error } = await supabase
    .from('votes')
    .select('option_id, user_id')
    .eq('poll_id', pollId);

  if (error) {
    console.error('Error fetching poll results:', error);
    showError('Failed to load poll results.');
    throw new Error(error.message);
  }

  const votes = data as VoteRecord[];
  
  // 1. Aggregate votes by option_id
  const voteCountsMap = votes.reduce((acc, vote) => {
    const optionId = vote.option_id;
    acc.set(optionId, (acc.get(optionId) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  // 2. Calculate total votes
  const totalVotes = votes.length;

  // 3. Calculate unique voters
  const uniqueVoters = new Set(votes.map(vote => vote.user_id)).size;

  // 4. Convert map to array of VoteCount objects
  const voteCounts: VoteCount[] = Array.from(voteCountsMap, ([option_id, count]) => ({
    option_id,
    count,
  }));

  return { voteCounts, totalVotes, uniqueVoters };
};

export const usePollResults = (pollId: string) => {
  return useQuery<PollResultsData, Error>({
    queryKey: ['pollResults', pollId],
    queryFn: () => fetchPollResults(pollId),
    enabled: !!pollId,
  });
};