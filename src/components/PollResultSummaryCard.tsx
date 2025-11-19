import React from 'react';
import { Poll } from '@/types/poll';
import { usePollResults } from '@/hooks/use-poll-results';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Vote, Clock, Star, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCurrentUserId } from '@/hooks/use-current-user-id';
import { useSavedPolls } from '@/hooks/use-saved-polls';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PollResultSummaryCardProps {
  poll: Poll;
}

const PollResultSummaryCard: React.FC<PollResultSummaryCardProps> = ({ poll }) => {
  const { data: results, isLoading } = usePollResults(poll.id);
  const currentUserId = useCurrentUserId();
  const { savedPolls, toggleSavePoll, isTogglingSave } = useSavedPolls();

  const isOwner = poll.user_id === currentUserId;
  const isSaved = savedPolls.has(poll.id);

  const totalVotes = React.useMemo(() => (results ? results.totalVotes : 0), [results]);
  const isExpired = poll.due_at && new Date(poll.due_at) < new Date();
  const isActive = poll.is_active && !isExpired;

  const handleCardAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <Link to={`/polls/${poll.id}/results`} className="block group">
      <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {isOwner && (
                <Tooltip>
                  <TooltipTrigger>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Created by You</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">{poll.title}</CardTitle>
            </div>
            <Badge variant={isActive ? "default" : "destructive"} className="ml-4">{isActive ? "Active" : "Closed"}</Badge>
          </div>
          {poll.description && <CardDescription className="line-clamp-2 mt-1">{poll.description}</CardDescription>}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center text-lg font-semibold text-primary">
              {isActive ? <Vote className="mr-2 h-5 w-5" /> : <Clock className="mr-2 h-5 w-5 text-destructive" />}
              {isLoading ? <Skeleton className="h-6 w-24" /> : <span>{totalVotes} Total Votes</span>}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={(e) => handleCardAction(e, () => toggleSavePoll(poll.id))} disabled={isTogglingSave} className="h-8 w-8 z-10" aria-label={isSaved ? 'Remove from saved polls' : 'Add to saved polls'}>
                <Bookmark className={cn("h-5 w-5", isSaved ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">Click to view detailed results</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PollResultSummaryCard;