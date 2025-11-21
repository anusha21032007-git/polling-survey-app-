import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePollSet } from '@/hooks/use-poll-set';
import { Button } from '@/components/ui/button';
import { Share2, User, Frown } from 'lucide-react';
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
import { showSuccess, showError } from '@/utils/toast';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import AnonymousVoterGate from '@/components/AnonymousVoterGate';
import PollDetailView from '@/components/PollDetailView';
import PollPageSkeleton from '@/components/PollPageSkeleton';
import { cn } from '@/lib/utils';

const PollSetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const setId = id || '';
  const { data: pollSet, isLoading: isPollLoading, isError, error } = usePollSet(setId);
  const { user, isLoading: isSessionLoading } = useSupabaseSession();
  const [anonymousVoterName, setAnonymousVoterName] = useState<string | null>(() => sessionStorage.getItem('anonymousVoterName'));

  const handleShare = () => {
    const pollSetUrl = window.location.href;
    navigator.clipboard.writeText(pollSetUrl).then(() => {
      showSuccess('Poll set link copied to clipboard!');
    }).catch(() => {
      showError('Failed to copy link.');
    });
  };

  const handleNameProvided = (name: string) => {
    sessionStorage.setItem('anonymousVoterName', name);
    setAnonymousVoterName(name);
  };

  const isLoading = isPollLoading || isSessionLoading;

  if (isLoading) {
    return <PollPageSkeleton />;
  }

  const isGated = !user && !anonymousVoterName;
  const isNotFound = !pollSet || pollSet.polls.length === 0;
  const shouldCenter = isGated || isNotFound || isError;

  let pageContent;

  if (isError) {
    pageContent = <div className="max-w-3xl mx-auto text-destructive p-6">Error loading poll set: {error?.message || 'Unknown error'}</div>;
  } else if (isNotFound) {
    pageContent = (
      <div className="max-w-3xl mx-auto text-center p-10 border rounded-lg bg-muted/50 flex flex-col items-center gap-4">
        <Frown className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Poll Set Not Found</h2>
        <p className="text-lg text-muted-foreground">
          This poll set is no longer available. It may have been deleted by its creator or contains no polls.
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Go back to Home</Link>
        </Button>
      </div>
    );
  } else if (isGated) {
    pageContent = <AnonymousVoterGate onNameProvided={handleNameProvided} />;
  } else if (pollSet) {
    const creatorName = pollSet.profiles?.full_name || pollSet.profiles?.username || 'Anonymous';
    pageContent = (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">{pollSet.title}</h1>
            {pollSet.description && <p className="text-lg text-muted-foreground mt-2">{pollSet.description}</p>}
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <User className="h-4 w-4 mr-2" />
              <span>Created by {creatorName}</span>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" title="Share Poll Set"><Share2 className="h-5 w-5" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Share Poll Set</AlertDialogTitle>
                <AlertDialogDescription>Copy the link below to share this entire set of polls with others.</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="p-2 bg-muted rounded-md text-sm overflow-x-auto"><code>{window.location.href}</code></div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleShare}>Copy Link</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="space-y-6">
          {pollSet.polls.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(poll => (
            <PollDetailView key={poll.id} poll={poll} anonymousVoterName={anonymousVoterName} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className={cn("flex-grow flex flex-col p-4 md:p-8", shouldCenter && "justify-center")}>
        {pageContent}
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        Developed By Anusha N
      </footer>
    </div>
  );
};

export default PollSetDetail;