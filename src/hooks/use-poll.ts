import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Poll } from '@/types/poll';
import { showError } from '@/utils/toast';

const fetchPoll = async (pollId: string): Promise<Poll> => {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .single();

  if (error) {
    // PGRST116 means no rows found
    if (error.code !== 'PGRST116') {
      console.error('Error fetching poll:', error);
      showError('Failed to load poll details.');
    }
    throw new Error(error.message);
  }

  return data as Poll;
};

export const usePoll = (pollId: string) => {
  return useQuery<Poll, Error>({
    queryKey: ['poll', pollId],
    queryFn: () => fetchPoll(pollId),
    enabled: !!pollId,
  });
};