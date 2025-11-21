import React from 'react';
import { PollSet } from '@/types/poll';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ListChecks, Star, User } from 'lucide-react';
import { useCurrentUserId } from '@/hooks/use-current-user-id';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PollSetCardProps {
  pollSet: PollSet;
}

const PollSetCard: React.FC<PollSetCardProps> = ({ pollSet }) => {
  const totalPolls = pollSet.polls?.length || 0;
  const isActive = pollSet.polls?.some(p => p.is_active && (!p.due_at || new Date(p.due_at) > new Date()));
  const currentUserId = useCurrentUserId();
  const isOwner = pollSet.user_id === currentUserId;
  const creatorName = pollSet.profiles?.full_name || pollSet.profiles?.username || 'Anonymous';

  return (
    <Link to={`/sets/${pollSet.id}`} className="block group">
      <Card className="hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] cursor-pointer h-full flex flex-col">
        <CardHeader className="p-4 pb-2">
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
              <CardTitle className="text-xl">{pollSet.title}</CardTitle>
            </div>
            <Badge variant={isActive ? "default" : "destructive"}>
              {isActive ? "Active" : "Closed"}
            </Badge>
          </div>
          {pollSet.description && (
            <CardDescription className="mt-1 line-clamp-2">{pollSet.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="mt-auto p-4 pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center">
              <ListChecks className="h-4 w-4 mr-1.5" />
              {totalPolls} {totalPolls === 1 ? 'Poll' : 'Polls'}
            </span>
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1.5" />
              {creatorName}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PollSetCard;