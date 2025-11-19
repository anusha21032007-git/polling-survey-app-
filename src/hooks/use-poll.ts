import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Poll } from '@/types/poll';
import { showError } from '@/utils/toast';

const fetchPoll = async (pollId: string): Promise<Poll | null> => {
  if (!pollId) return null;

  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // Ignore "no rows found"
      console.error('Error fetching poll:', error);
      showError('Failed to load poll details.');
    }
    // For not found, it's better to return null than throw
    return null;
  }

  return data as Poll;
};

export const usePoll = (pollId: string) => {
  return useQuery<Poll | null, Error>({
    queryKey: ['poll', pollId],
    queryFn: () => fetchPoll(pollId),
    enabled: !!pollId,
  });
};