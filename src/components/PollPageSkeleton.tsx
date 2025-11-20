import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PollPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-6 w-64 mt-3" />
        </div>
        <Skeleton className="h-10 w-10" />
      </div>
      
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PollPageSkeleton;