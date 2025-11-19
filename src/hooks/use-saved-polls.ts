import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { showError } from '@/utils/toast';

interface SavedPoll {
  poll_id: string;
}

const fetchSavedPolls = async (userId: string): Promise<Set<string>> => {
  const { data, error } = await supabase
    .from('saved_polls')
    .select('poll_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching saved polls:', error);
    throw new Error(error.message);
  }

  return new Set(data.map((saved: SavedPoll) => saved.poll_id));
};

const toggleSaveStatus = async ({ userId, pollId, isSaved }: { userId: string; pollId: string; isSaved: boolean }) => {
  if (isSaved) {
    // Remove from saved polls
    const { error } = await supabase
      .from('saved_polls')
      .delete()
      .eq('user_id', userId)
      .eq('poll_id', pollId);
    if (error) throw error;
  } else {
    // Add to saved polls
    const { error } = await supabase
      .from('saved_polls')
      .insert({ user_id: userId, poll_id: pollId });
    if (error) throw error;
  }
};

export const useSavedPolls = () => {
  const { user } = useSupabaseSession();
  const queryClient = useQueryClient();
  const queryKey = ['savedPolls', user?.id];

  const { data: savedPolls = new Set<string>(), isLoading } = useQuery<Set<string>, Error>({
    queryKey,
    queryFn: () => fetchSavedPolls(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation<void, Error, string, { previousSaved?: Set<string> }>({
    mutationFn: (pollId: string) => {
      const isSaved = savedPolls.has(pollId);
      return toggleSaveStatus({ userId: user!.id, pollId, isSaved });
    },
    onMutate: async (pollId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previousSaved = queryClient.getQueryData<Set<string>>(queryKey);
      queryClient.setQueryData<Set<string>>(queryKey, (old = new Set()) => {
        const newSaved = new Set(old);
        if (newSaved.has(pollId)) {
          newSaved.delete(pollId);
        } else {
          newSaved.add(pollId);
        }
        return newSaved;
      });
      return { previousSaved };
    },
    onError: (err, _pollId, context) => {
      queryClient.setQueryData(queryKey, context?.previousSaved);
      showError(`Failed to update saved poll: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    savedPolls,
    isLoading,
    toggleSavePoll: mutation.mutate,
    isTogglingSave: mutation.isPending,
  };
};