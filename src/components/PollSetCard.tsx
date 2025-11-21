import React from 'react';
import { PollSet } from '@/types/poll';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ListChecks, Star, User, Trash2 } from 'lucide-react';
import { useCurrentUserId } from '@/hooks/use-current-user-id';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDeletePollSet } from '@/hooks/use-delete-poll-set';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from './ui/button';

interface PollSetCardProps {
  pollSet: PollSet;
}

const PollSetCard: React.FC<PollSetCardProps> = ({ pollSet }) => {
  const totalPolls = pollSet.polls?.length || 0;
  const isActive = pollSet.polls?.some(p => p.is_active && (!p.due_at || new Date(p.due_at) > new Date()));
  const currentUserId = useCurrentUserId();
  const isOwner = pollSet.user_id === currentUserId;
  const creatorName = pollSet.profiles?.full_name || pollSet.profiles?.username || 'Anonymous';
  const { mutate: deletePollSet, isPending: isDeleting } = useDeletePollSet();

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deletePollSet(pollSet.id);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <AlertDialog>
      <Link to={`/sets/${pollSet.id}`} className="block group h-full">
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
              <div className="flex items-center gap-4">
                <span className="flex items-center">
                  <ListChecks className="h-4 w-4 mr-1.5" />
                  {totalPolls} {totalPolls === 1 ? 'Poll' : 'Polls'}
                </span>
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1.5" />
                  {creatorName}
                </span>
              </div>
              {isOwner && (
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleTriggerClick}
                    aria-label="Delete poll set"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the poll set "{pollSet.title}" and all of its associated polls and votes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PollSetCard;