import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePollVoters, Voter } from '@/hooks/use-poll-voters';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';

interface VoterListDialogProps {
  pollId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  totalResponses: number;
}

const VoterListDialog: React.FC<VoterListDialogProps> = ({ pollId, isOpen, onOpenChange, totalResponses }) => {
  const { data: voters, isLoading, isError } = usePollVoters(pollId, isOpen);

  const renderVoterItem = (voter: Voter) => {
    const displayName = voter.full_name || voter.username || 'Anonymous User';
    const secondaryInfo = voter.full_name && voter.username ? `@${voter.username}` : '';

    return (
      <div key={voter.user_id} className="flex items-center space-x-3 p-3 border-b last:border-b-0">
        <User className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{displayName}</p>
          {secondaryInfo && <p className="text-sm text-muted-foreground">{secondaryInfo}</p>}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Voters ({totalResponses})</DialogTitle>
          <DialogDescription>
            List of unique users who participated in this poll.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-80 w-full rounded-md border">
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : isError || !voters ? (
              <p className="text-destructive">Failed to load voter list.</p>
            ) : voters.length === 0 ? (
              <p className="text-muted-foreground">No unique voters found yet.</p>
            ) : (
              voters.map(renderVoterItem)
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default VoterListDialog;