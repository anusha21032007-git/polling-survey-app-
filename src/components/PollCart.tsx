import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePollCart } from '@/hooks/use-poll-cart';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Trash2, Share2, ShoppingCart } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface PollCartProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PollCart: React.FC<PollCartProps> = ({ isOpen, onOpenChange }) => {
  const { cartPolls, isLoading, toggleCart, isToggling } = usePollCart();

  const handleShare = () => {
    if (cartPolls.length === 0) {
      showError("You have no saved polls to share!");
      return;
    }
    const pollLinks = cartPolls.map(poll => `${window.location.origin}/polls/${poll.id}`).join('\n');
    const shareText = `Check out this collection of polls:\n${pollLinks}`;
    navigator.clipboard.writeText(shareText).then(() => {
      showSuccess('Poll collection copied to clipboard!');
    }).catch(() => {
      showError('Failed to copy links.');
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center"><ShoppingCart className="mr-2 h-5 w-5" /> Saved Polls</SheetTitle>
          <SheetDescription>
            You have {cartPolls.length} poll(s) saved.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : cartPolls.length === 0 ? (
            <div className="text-center text-muted-foreground p-10">You have no saved polls.</div>
          ) : (
            <div className="space-y-3 p-1">
              {cartPolls.map(poll => (
                <div key={poll.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex-grow overflow-hidden">
                    <Link to={`/polls/${poll.id}`} className="font-medium truncate hover:underline" onClick={() => onOpenChange(false)}>
                      {poll.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{poll.options.length} options</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleCart(poll.id)}
                    disabled={isToggling}
                    className="text-destructive flex-shrink-0 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <SheetFooter>
          <div className="w-full space-y-2">
            <Button onClick={handleShare} className="w-full" disabled={cartPolls.length === 0}>
              <Share2 className="mr-2 h-4 w-4" /> Share Collection
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PollCart;