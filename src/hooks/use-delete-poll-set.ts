import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

const deletePollSet = async (pollSetId: string) => {
  const { error } = await supabase.functions.invoke('delete-poll-set', {
    method: 'POST',
    body: { pollSetId },
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const useDeletePollSet = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deletePollSet,
    onSuccess: () => {
      showSuccess('Poll set deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['poll_sets'] });
    },
    onError: (error) => {
      showError(`Failed to delete poll set: ${error.message}`);
    },
  });
};