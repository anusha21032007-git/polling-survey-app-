import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Poll } from '@/types/poll';
import { showError } from '@/utils/toast';

const fetchPollsByIds = async (pollIds: string[]): Promise<Poll[]> => {
  if (!pollIds || pollIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .in('id', pollIds);

  if (error) {
    console.error('Error fetching polls by IDs:', error);
    showError('Failed to load saved polls.');
    throw new Error(error.message);
  }

  return data as Poll[];
};

export const usePollsByIds = (pollIds: string[]) => {
  return useQuery<Poll[], Error>({
    queryKey: ['polls', pollIds],
    queryFn: () => fetchPollsByIds(pollIds),
    enabled: pollIds.length > 0,
  });
};