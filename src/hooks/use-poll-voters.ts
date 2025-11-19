import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export interface Voter {
  display_name: string;
}

const fetchPollVoters = async (pollId: string): Promise<Voter[]> => {
  const { data, error } = await supabase
    .rpc('get_poll_voters', { p_poll_id: pollId });

  if (error) {
    console.error('Error fetching voter list:', error);
    showError('Failed to load voter list.');
    throw new Error(error.message);
  }

  return (data as Voter[]) || [];
};

export const usePollVoters = (pollId: string, enabled: boolean = true) => {
  return useQuery<Voter[], Error>({
    queryKey: ['pollVoters', pollId],
    queryFn: () => fetchPollVoters(pollId),
    enabled: !!pollId && enabled,
  });
};