import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PollSet } from '@/types/poll';
import { showError } from '@/utils/toast';

const fetchPollSets = async (): Promise<PollSet[]> => {
  const { data, error } = await supabase
    .from('poll_sets')
    .select('*, polls(*), profiles(full_name, username)') // Fetch sets, their nested polls, and creator profile
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching poll sets:', error);
    showError('Failed to load poll sets.');
    throw new Error(error.message);
  }

  return data as PollSet[];
};

export const usePollSets = () => {
  return useQuery<PollSet[], Error>({
    queryKey: ['poll_sets'],
    queryFn: fetchPollSets,
  });
};