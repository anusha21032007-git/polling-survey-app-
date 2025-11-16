import React from 'react';
import { PollResultsData } from '@/hooks/use-poll-results';
import { Poll } from '@/types/poll';
import StatCard from '@/components/dashboard/StatCard';
import { Users, ListChecks, Clock } from 'lucide-react';

interface PollResultsStatsProps {
  poll: Poll;
  resultsData: PollResultsData | undefined;
  isLoading: boolean;
}

const PollResultsStats: React.FC<PollResultsStatsProps> = ({ poll, resultsData, isLoading }) => {
  const totalResponses = resultsData?.totalVotes ?? 0;
  const uniqueVoters = resultsData?.uniqueVoters ?? 0;
  
  const isExpired = poll.due_at && new Date(poll.due_at) < new Date();
  const statusText = poll.is_active && !isExpired ? 'Active' : 'Closed';
  const statusIcon = poll.is_active && !isExpired ? <ListChecks className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-red-500" />;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Total Responses"
        value={totalResponses}
        icon={<Users className="h-5 w-5 text-primary" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Unique Voters"
        value={uniqueVoters}
        icon={<ListChecks className="h-5 w-5 text-primary" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Poll Status"
        value={statusText}
        icon={statusIcon}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PollResultsStats;