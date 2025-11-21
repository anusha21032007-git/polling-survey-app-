import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PollSet } from '@/types/poll';
import { showError } from '@/utils/toast';

const fetchPollSet = async (setId: string): Promise<PollSet | null> => {
  const { data, error } = await supabase
    .from('poll_sets')
    .select('*, polls(*), profiles(full_name, username)')
    .eq('id', setId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching poll set:', error);
      showError('Failed to load poll set details.');
    }
    // For not found or other errors, it's better to return null than throw
    return null;
  }

  return data as PollSet;
};

export const usePollSet = (setId: string) => {
  return useQuery<PollSet | null, Error>({
    queryKey: ['pollSet', setId],
    queryFn: () => fetchPollSet(setId),
    enabled: !!setId,
  });
};