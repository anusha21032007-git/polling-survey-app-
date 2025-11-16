import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Poll } from '@/types/poll';
import { showError } from '@/utils/toast';

const fetchPolls = async (): Promise<Poll[]> => {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching polls:', error);
    showError('Failed to load polls.');
    throw new Error(error.message);
  }

  return data as Poll[];
};

export const usePolls = () => {
  return useQuery<Poll[], Error>({
    queryKey: ['polls'],
    queryFn: fetchPolls,
  });
};