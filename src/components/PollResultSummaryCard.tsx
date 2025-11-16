import React from 'react';
import { Poll } from '@/types/poll';
import { usePollResults } from '@/hooks/use-poll-results';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Vote, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PollResultSummaryCardProps {
  poll: Poll;
}

const PollResultSummaryCard: React.FC<PollResultSummaryCardProps> = ({ poll }) => {
  const { data: results, isLoading } = usePollResults(poll.id);

  const totalVotes = React.useMemo(() => {
    if (!results) return 0;
    return results.totalVotes;
  }, [results]);

  const isExpired = poll.due_at && new Date(poll.due_at) < new Date();
  const isActive = poll.is_active && !isExpired;

  return (
    <Link to={`/polls/${poll.id}/results`} className="block group">
      <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
              {poll.title}
            </CardTitle>
            <Badge variant={isActive ? "default" : "destructive"} className="ml-4">
              {isActive ? "Active" : "Closed"}
            </Badge>
          </div>
          {poll.description && (
            <CardDescription className="line-clamp-2 mt-1">{poll.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center text-lg font-semibold text-primary">
              {isActive ? (
                <Vote className="mr-2 h-5 w-5" />
              ) : (
                <Clock className="mr-2 h-5 w-5 text-destructive" />
              )}
              
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <span>{totalVotes} Total Votes</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                {poll.options.length} Options
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">
            Click to view detailed results
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PollResultSummaryCard;