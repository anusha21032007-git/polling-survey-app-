import React from 'react';
import { usePollSets } from '@/hooks/use-poll-sets';
import PollSetCard from './PollSetCard';
import { Skeleton } from '@/components/ui/skeleton';

const PollList: React.FC = () => {
  const { data: pollSets, isLoading, isError, error } = usePollSets();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg shadow-sm bg-card space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive">Error loading polls: {error?.message || 'Unknown error'}</div>;
  }

  if (!pollSets || pollSets.length === 0) {
    return (
      <div className="text-center p-10 border rounded-lg bg-muted/50">
        <p className="text-lg text-muted-foreground">No polls available yet. Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pollSets.map((pollSet) => (
        <PollSetCard key={pollSet.id} pollSet={pollSet} />
      ))}
    </div>
  );
};

export default PollList;