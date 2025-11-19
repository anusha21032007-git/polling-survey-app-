import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { showError } from '@/utils/toast';
import { Poll } from '@/types/poll';

const fetchPollCartIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_poll_cart')
    .select('poll_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map(item => item.poll_id);
};

const fetchPollsByIds = async (pollIds: string[]): Promise<Poll[]> => {
  if (pollIds.length === 0) return [];
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .in('id', pollIds);
  if (error) throw error;
  return data as Poll[];
};

const toggleCartStatus = async ({ userId, pollId, isInCart }: { userId: string; pollId: string; isInCart: boolean }) => {
  if (isInCart) {
    const { error } = await supabase.from('user_poll_cart').delete().match({ user_id: userId, poll_id: pollId });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('user_poll_cart').insert({ user_id: userId, poll_id: pollId });
    if (error) throw error;
  }
};

export const usePollCart = () => {
  const { user } = useSupabaseSession();
  const queryClient = useQueryClient();
  const cartIdsQueryKey = ['pollCartIds', user?.id];

  const { data: cartPollIds = [], isLoading: isLoadingIds } = useQuery<string[], Error>({
    queryKey: cartIdsQueryKey,
    queryFn: () => fetchPollCartIds(user!.id),
    enabled: !!user,
  });

  const { data: cartPolls = [], isLoading: isLoadingPolls } = useQuery<Poll[], Error>({
    queryKey: ['pollCartItems', cartPollIds],
    queryFn: () => fetchPollsByIds(cartPollIds),
    enabled: !!user && cartPollIds.length > 0,
  });

  const mutation = useMutation<void, Error, string>({
    mutationFn: (pollId: string) => {
      const isInCart = cartPollIds.includes(pollId);
      return toggleCartStatus({ userId: user!.id, pollId, isInCart });
    },
    onMutate: async (pollId: string) => {
      await queryClient.cancelQueries({ queryKey: cartIdsQueryKey });
      const previousCartIds = queryClient.getQueryData<string[]>(cartIdsQueryKey) || [];
      queryClient.setQueryData<string[]>(cartIdsQueryKey, (old = []) => {
        return old.includes(pollId) ? old.filter(id => id !== pollId) : [...old, pollId];
      });
      return { previousCartIds };
    },
    onError: (err, _pollId, context) => {
      queryClient.setQueryData(cartIdsQueryKey, context?.previousCartIds);
      showError(`Failed to update cart: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartIdsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['pollCartItems'] });
    },
  });

  return {
    cartPollIds,
    cartPolls,
    isLoading: isLoadingIds || isLoadingPolls,
    toggleCart: mutation.mutate,
    isToggling: mutation.isPending,
  };
};