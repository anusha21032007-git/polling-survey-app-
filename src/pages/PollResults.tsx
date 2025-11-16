import React from 'react';
import { useParams } from 'react-router-dom';
import { usePoll } from '@/hooks/use-poll';
import { usePolls } from '@/hooks/use-polls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PollResultsView from '@/components/PollResultsView';
import PollResultSummaryCard from '@/components/PollResultSummaryCard';
import { useUserRole } from '@/hooks/use-user-role';

// Component for the list view of all poll results
const PollResultsList: React.FC = () => {
  const { data: polls, isLoading, isError, error } = usePolls();
  const { isAdmin, isLoading: isRoleLoading } = useUserRole();

  if (isLoading || isRoleLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Poll Results & Analytics</h1>
        <div className="space-y-8">
          <Card>
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-64 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-64 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive">Error loading polls: {error?.message}</div>;
  }

  if (!polls || polls.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <p className="text-muted-foreground">No polls found to display results for.</p>
        </CardContent>
      </Card>
    );
  }

  // Admin View: Show detailed results for all polls
  if (isAdmin) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Poll Results & Analytics</h1>
        <p className="text-muted-foreground">
          Here is a detailed breakdown of all polls.
        </p>
        <div className="space-y-8">
          {polls.map(poll => (
            <PollResultsView key={poll.id} poll={poll} />
          ))}
        </div>
      </div>
    );
  }

  // Regular User View: Show summary cards
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Poll Results & Analytics</h1>
      <p className="text-muted-foreground">
        Here is a summary of all polls. Click on a poll to see a detailed breakdown of the results.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map(poll => (
          <PollResultSummaryCard key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  );
};

// Component for the detail view of a single poll's results
const PollResultsDetail: React.FC<{ pollId: string }> = ({ pollId }) => {
  const { data: poll, isLoading, isError, error } = usePoll(pollId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto text-destructive p-6">
        Error loading poll: {error?.message || 'Unknown error'}
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-3xl mx-auto text-center p-10 border rounded-lg bg-muted/50">
        <p className="text-lg text-muted-foreground">Poll not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PollResultsView poll={poll} />
    </div>
  );
};

const PollResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const pollId = id || '';
  
  if (pollId) {
    return <PollResultsDetail pollId={pollId} />;
  }

  return <PollResultsList />;
};

export default PollResults;