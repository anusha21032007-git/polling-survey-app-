import React from 'react';
import { useParams } from 'react-router-dom';
import { usePoll } from '@/hooks/use-poll';
import { usePollSets } from '@/hooks/use-poll-sets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PollResultsView from '@/components/PollResultsView';
import PollResultSummaryCard from '@/components/PollResultSummaryCard';
import { useUserRole } from '@/hooks/use-user-role';
import { useCurrentUserId } from '@/hooks/use-current-user-id';

// Component for the list view of all poll results
const PollResultsList: React.FC = () => {
  const { data: pollSets, isLoading, isError, error } = usePollSets();
  const { isAdmin, isLoading: isRoleLoading } = useUserRole();
  const currentUserId = useCurrentUserId();

  if (isLoading || isRoleLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Poll Results & Analytics</h1>
        <div className="space-y-8">
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

  const pollSetsToDisplay = isAdmin
    ? pollSets
    : pollSets?.filter(set => set.user_id === currentUserId) || [];

  if (!pollSetsToDisplay || pollSetsToDisplay.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <p className="text-muted-foreground">
            {isAdmin
              ? 'No polls found to display results for.'
              : 'You have not created any polls yet.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  const viewTitle = isAdmin ? "Poll Results & Analytics (Admin View)" : "My Poll Results";
  const viewDescription = isAdmin
    ? "Here is a summary of all polls, grouped by their set."
    : "Here is a summary of the poll sets you created. Click on a poll to see its detailed results.";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{viewTitle}</h1>
      <p className="text-muted-foreground">{viewDescription}</p>
      <div className="space-y-8">
        {pollSetsToDisplay.map(set => (
          <Card key={set.id}>
            <CardHeader>
              <CardTitle>{set.title}</CardTitle>
              {set.description && <CardDescription>{set.description}</CardDescription>}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {set.polls.map(poll => (
                <PollResultSummaryCard key={poll.id} poll={poll} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Component for the detail view of a single poll's results
const PollResultsDetail: React.FC<{ pollId: string }> = ({ pollId }) => {
  const { data: poll, isLoading, isError, error } = usePoll(pollId);
  const { role, isLoading: isRoleLoading } = useUserRole();
  const currentUserId = useCurrentUserId();

  if (isLoading || isRoleLoading) {
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
  
  const isPollOwner = currentUserId === poll.user_id;
  const isAdmin = role === 'admin';

  // Authorization Check: Only owner or admin can view detailed results
  if (!isPollOwner && !isAdmin) {
    return (
      <div className="max-w-3xl mx-auto text-center p-10 border rounded-lg bg-destructive/10 text-destructive">
        <p className="text-lg font-semibold">Access Denied</p>
        <p className="text-muted-foreground mt-2">Only the poll creator or an administrator can view the detailed results for this poll.</p>
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