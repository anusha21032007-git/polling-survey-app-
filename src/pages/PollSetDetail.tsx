import React from 'react';
import { useParams } from 'react-router-dom';
import { usePollSet } from '@/hooks/use-poll-set';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PollDetailView from '@/components/PollDetailView'; // Re-using the detailed view component for each poll

const PollSetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const setId = id || '';
  const { data: pollSet, isLoading, isError, error } = usePollSet(setId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4"><Skeleton className="h-96 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return <div className="max-w-3xl mx-auto text-destructive p-6">Error loading poll set: {error?.message || 'Unknown error'}</div>;
  }

  if (!pollSet) {
    return (
      <div className="max-w-3xl mx-auto text-center p-10 border rounded-lg bg-muted/50">
        <p className="text-lg text-muted-foreground">Poll set not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">{pollSet.title}</h1>
        {pollSet.description && <p className="text-lg text-muted-foreground mt-2">{pollSet.description}</p>}
      </div>
      
      <div className="space-y-6">
        {pollSet.polls.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(poll => (
          <PollDetailView key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  );
};

export default PollSetDetail;