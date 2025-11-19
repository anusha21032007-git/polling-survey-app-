import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { showError } from '@/utils/toast';

interface Favorite {
  poll_id: string;
}

const fetchUserFavorites = async (userId: string): Promise<Set<string>> => {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('poll_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user favorites:', error);
    throw new Error(error.message);
  }

  return new Set(data.map((fav: Favorite) => fav.poll_id));
};

const toggleFavoriteStatus = async ({ userId, pollId, isFavorited }: { userId: string; pollId: string; isFavorited: boolean }) => {
  if (isFavorited) {
    // Remove from favorites
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('poll_id', pollId);
    if (error) throw error;
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('user_favorites')
      .insert({ user_id: userId, poll_id: pollId });
    if (error) throw error;
  }
};

export const useUserFavorites = () => {
  const { user } = useSupabaseSession();
  const queryClient = useQueryClient();
  const queryKey = ['userFavorites', user?.id];

  const { data: favorites = new Set<string>(), isLoading } = useQuery<Set<string>, Error>({
    queryKey,
    queryFn: () => fetchUserFavorites(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation<void, Error, string, { previousFavorites?: Set<string> }>({
    mutationFn: (pollId: string) => {
      const isFavorited = favorites.has(pollId);
      return toggleFavoriteStatus({ userId: user!.id, pollId, isFavorited });
    },
    onMutate: async (pollId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previousFavorites = queryClient.getQueryData<Set<string>>(queryKey);
      queryClient.setQueryData<Set<string>>(queryKey, (old = new Set()) => {
        const newFavorites = new Set(old);
        if (newFavorites.has(pollId)) {
          newFavorites.delete(pollId);
        } else {
          newFavorites.add(pollId);
        }
        return newFavorites;
      });
      return { previousFavorites };
    },
    onError: (err, _pollId, context) => {
      queryClient.setQueryData(queryKey, context?.previousFavorites);
      showError(`Failed to update favorite: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    favorites,
    isLoading,
    toggleFavorite: mutation.mutate,
    isToggling: mutation.isPending,
  };
};