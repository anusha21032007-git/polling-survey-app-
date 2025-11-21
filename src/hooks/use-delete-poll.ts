import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

const deletePoll = async (pollId: string) => {
  const { error } = await supabase.functions.invoke('delete-poll', {
    method: 'POST',
    body: { pollId },
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const useDeletePoll = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deletePoll,
    onSuccess: (_, pollId) => {
      showSuccess('Poll deleted successfully.');
      // Invalidate queries to reflect the change
      queryClient.invalidateQueries({ queryKey: ['poll_sets'] });
      queryClient.invalidateQueries({ queryKey: ['pollSet'] });
      queryClient.removeQueries({ queryKey: ['poll', pollId] });
    },
    onError: (error) => {
      showError(`Failed to delete poll: ${error.message}`);
    },
  });
};