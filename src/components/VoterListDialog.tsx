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

  const renderVoterItem = (voter: Voter, index: number) => {
    return (
      <div key={index} className="flex items-center space-x-3 p-3 border-b last:border-b-0">
        <User className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{voter.display_name}</p>
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
              voters.map((voter, index) => renderVoterItem(voter, index))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default VoterListDialog;