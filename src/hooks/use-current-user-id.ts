import { useSupabaseSession } from '@/integrations/supabase/session-context';

export const useCurrentUserId = (): string | null => {
  const { user } = useSupabaseSession();
  return user?.id || null;
};