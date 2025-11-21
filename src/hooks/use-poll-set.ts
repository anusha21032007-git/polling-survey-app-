import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PollSet } from '@/types/poll';
import { showError } from '@/utils/toast';

const fetchPollSet = async (setId: string): Promise<PollSet> => {
  const { data, error } = await supabase
    .from('poll_sets')
    .select('*, polls(*), profiles(full_name, username)')
    .eq('id', setId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching poll set:', error);
      showError('Failed to load poll set details.');
    }
    throw new Error(error.message);
  }

  return data as PollSet;
};

export const usePollSet = (setId: string) => {
  return useQuery<PollSet, Error>({
    queryKey: ['pollSet', setId],
    queryFn: () => fetchPollSet(setId),
    enabled: !!setId,
  });
};