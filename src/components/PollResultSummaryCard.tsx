import React from 'react';
import { Poll } from '@/types/poll';
import { usePollResults } from '@/hooks/use-poll-results';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Vote } from 'lucide-react';

interface PollResultSummaryCardProps {
  poll: Poll;
}

const PollResultSummaryCard: React.FC<PollResultSummaryCardProps> = ({ poll }) => {
  const { data: results, isLoading } = usePollResults(poll.id);

  const totalVotes = React.useMemo(() => {
    if (!results) return 0;
    return results.reduce((sum, result) => sum + result.count, 0);
  }, [results]);

  return (
    <Link to={`/polls/${poll.id}/results`} className="block group">
      <Card className="hover:shadow-lg transition-all duration-300 group-hover:border-primary">
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
          {poll.description && (
            <CardDescription className="line-clamp-2">{poll.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-lg font-semibold text-primary">
            <Vote className="mr-2 h-5 w-5" />
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <span>{totalVotes} Total Votes</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Click to view detailed results</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PollResultSummaryCard;