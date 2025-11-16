import React from 'react';
import { useParams } from 'react-router-dom';
import { usePoll } from '@/hooks/use-poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PollResultsView from '@/components/PollResultsView';

const PollResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const pollId = id || '';
  
  // Fetch poll details to get options and title
  const { data: poll, isLoading, isError, error } = usePoll(pollId);

  if (!pollId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Poll Results & Analytics</h1>
        <Card>
          <CardHeader>
            <CardTitle>Select a Poll</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please navigate to a specific poll's detail page to view its results. 
              (e.g., /polls/&lt;poll_id&gt;/results)
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

export default PollResults;