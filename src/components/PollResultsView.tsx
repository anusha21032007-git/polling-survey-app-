import React from 'react';
import { Poll } from '@/types/poll';
import { usePollResults } from '@/hooks/use-poll-results';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PollResultsStats from './PollResultsStats';
import PollOptionBreakdown from './PollOptionBreakdown';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PollResultsViewProps {
  poll: Poll;
}

const PollResultsView: React.FC<PollResultsViewProps> = ({ poll }) => {
  const { data: resultsData, isLoading, isError, error } = usePollResults(poll.id);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive">Error loading results: {error?.message}</div>;
  }

  if (!resultsData) {
    return <div className="text-center p-10 text-muted-foreground">No results data available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <ArrowLeft className="h-6 w-6 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)} />
        <div>
          <h1 className="text-2xl font-bold">Poll Results</h1>
          <p className="text-muted-foreground">{poll.title}</p>
        </div>
      </div>

      {/* Tabs (Placeholder for time filtering) */}
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="7days" disabled>Last 7 Days</TabsTrigger>
          <TabsTrigger value="30days" disabled>Last 30 Days</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6 space-y-6">
          
          {/* Stat Cards */}
          <PollResultsStats poll={poll} resultsData={resultsData} isLoading={isLoading} />

          {/* Detailed Breakdown */}
          <PollOptionBreakdown poll={poll} resultsData={resultsData} />

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PollResultsView;