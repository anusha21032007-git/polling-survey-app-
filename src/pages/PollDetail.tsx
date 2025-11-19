import React from 'react';
import { useParams } from 'react-router-dom';
import { usePoll } from '@/hooks/use-poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PollDetailView from '@/components/PollDetailView';

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const pollId = id || '';
  const { data: poll, isLoading, isError, error } = usePoll(pollId);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-xl mx-auto text-destructive p-6">
        Error loading poll: {error?.message || 'Unknown error'}
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-xl mx-auto text-center p-10 border rounded-lg bg-muted/50">
        <p className="text-lg text-muted-foreground">Poll not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <PollDetailView poll={poll} />
    </div>
  );
};

export default PollDetail;