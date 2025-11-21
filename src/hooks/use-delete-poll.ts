import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  return useMutation<void, Error, string>({
    mutationFn: deletePoll,
    onSuccess: (_, pollId) => {
      showSuccess('Poll deleted successfully.');
      // Invalidate queries to reflect the change
      queryClient.invalidateQueries({ queryKey: ['poll_sets'] });
      queryClient.invalidateQueries({ queryKey: ['pollSet'] });
      queryClient.removeQueries({ queryKey: ['poll', pollId] });
      navigate('/'); // Navigate to home page on success
    },
    onError: (error) => {
      showError(`Failed to delete poll: ${error.message}`);
    },
  });
};