import React, { useState } from 'react';
import { PollResultsData } from '@/hooks/use-poll-results';
import { Poll } from '@/types/poll';
import StatCard from '@/components/dashboard/StatCard';
import { Users, ListChecks, Clock } from 'lucide-react';
import VoterListDialog from './VoterListDialog';
import { Card } from '@/components/ui/card';

interface PollResultsStatsProps {
  poll: Poll;
  resultsData: PollResultsData | undefined;
  isLoading: boolean;
}

const PollResultsStats: React.FC<PollResultsStatsProps> = ({ poll, resultsData, isLoading }) => {
  const [isVoterListOpen, setIsVoterListOpen] = useState(false);
  
  const totalResponses = resultsData?.totalVotes ?? 0;
  const uniqueVoters = resultsData?.uniqueVoters ?? 0;
  
  const isExpired = poll.due_at && new Date(poll.due_at) < new Date();
  const statusText = poll.is_active && !isExpired ? 'Active' : 'Closed';
  const statusIcon = poll.is_active && !isExpired ? <ListChecks className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-red-500" />;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Responses"
          value={totalResponses}
          icon={<Users className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        
        {/* Unique Voters Card - Clickable to open dialog */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsVoterListOpen(true)}
        >
          <StatCard
            title="Unique Voters"
            value={uniqueVoters}
            icon={<ListChecks className="h-5 w-5 text-primary" />}
            isLoading={isLoading}
          />
        </Card>

        <StatCard
          title="Poll Status"
          value={statusText}
          icon={statusIcon}
          isLoading={isLoading}
        />
      </div>
      
      {/* Voter List Dialog */}
      <VoterListDialog 
        pollId={poll.id}
        isOpen={isVoterListOpen}
        onOpenChange={setIsVoterListOpen}
        totalResponses={uniqueVoters}
      />
    </>
  );
};

export default PollResultsStats;