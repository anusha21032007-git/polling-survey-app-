import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { showError } from '@/utils/toast';

export interface UserPollStat {
  id: string;
  title: string;
  created_at: string;
  total_responses: number;
}

export interface UserDashboardStats {
  total_polls: number;
  total_responses: number;
}

const fetchDashboardData = async (userId: string) => {
  const { data: statsData, error: statsError } = await supabase
    .rpc('get_user_dashboard_stats', { p_user_id: userId })
    .single();

  if (statsError) {
    console.error('Error fetching dashboard stats:', statsError);
    showError('Failed to load dashboard statistics.');
    throw new Error(statsError.message);
  }

  const { data: recentPollsData, error: recentPollsError } = await supabase
    .rpc('get_user_polls_with_stats', { p_user_id: userId });

  if (recentPollsError) {
    console.error('Error fetching recent polls:', recentPollsError);
    showError('Failed to load recent polls.');
    throw new Error(recentPollsError.message);
  }

  return {
    stats: statsData as UserDashboardStats,
    recentPolls: recentPollsData as UserPollStat[],
  };
};

export const useUserDashboard = () => {
  const { user } = useSupabaseSession();

  return useQuery({
    queryKey: ['userDashboard', user?.id],
    queryFn: () => fetchDashboardData(user!.id),
    enabled: !!user,
  });
};