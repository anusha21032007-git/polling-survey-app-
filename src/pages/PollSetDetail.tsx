import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePollSet } from '@/hooks/use-poll-set';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
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

  // Prioritize showing the skeleton while poll data is loading.
  if (isPollLoading) {
    return <PollPageSkeleton />;
  }

  if (isError) {
    return <div className="max-w-3xl mx-auto text-destructive p-6">Error loading poll set: {error?.message || 'Unknown error'}</div>;
  }

  if (!pollSet) {
    return (
      <div className="max-w-3xl mx-auto text-center p-10 border rounded-lg bg-muted/50">
        <p className="text-lg text-muted-foreground">Poll set not found.</p>
      </div>
    );
  }

  // After poll data is loaded, check the session. Show skeleton if it's still resolving.
  if (isSessionLoading) {
    return <PollPageSkeleton />;
  }

  // Session is resolved. If user is anonymous, show the name gate.
  if (!user && !anonymousVoterName) {
    return <AnonymousVoterGate onNameProvided={handleNameProvided} />;
  }

  // All checks passed, render the full poll set.
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">{pollSet.title}</h1>
          {pollSet.description && <p className="text-lg text-muted-foreground mt-2">{pollSet.description}</p>}
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
};

export default PollSetDetail;