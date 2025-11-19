import React, { useState, useEffect } from 'react';
import { Poll } from '@/types/poll';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserVote } from '@/hooks/use-user-vote';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { useCurrentUserId } from '@/hooks/use-current-user-id';
import { Pencil, BarChart3, ArrowLeft, Star, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { useSavedPolls } from '@/hooks/use-saved-polls';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PollDetailViewProps {
  poll: Poll;
  anonymousVoterName: string | null;
}

const PollDetailView: React.FC<PollDetailViewProps> = ({ poll, anonymousVoterName }) => {
  const { user } = useSupabaseSession();
  const { isLoading: isRoleLoading } = useUserRole();
  const currentUserId = useCurrentUserId();
  const isPollOwner = currentUserId === poll.user_id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: existingVotes, isLoading: isLoadingVotes } = useUserVote(poll.id);
  const { savedPolls, toggleSavePoll, isTogglingSave } = useSavedPolls();
  
  const isSingleChoice = poll.poll_type === 'single';
  const isSaved = savedPolls.has(poll.id);

  const initialSelectedOption = React.useMemo(() => {
    if (user && existingVotes) {
      return isSingleChoice 
        ? existingVotes[0]?.option_id || '' 
        : existingVotes.map(v => v.option_id);
    }
    return isSingleChoice ? '' : [];
  }, [existingVotes, isSingleChoice, user]);

  const [selectedOption, setSelectedOption] = useState<string | string[]>(initialSelectedOption);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVotedAnonymously, setHasVotedAnonymously] = useState(false);

  useEffect(() => {
    if (!user) { // Only for anonymous users
      const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '[]');
      if (votedPolls.includes(poll.id)) {
        setHasVotedAnonymously(true);
      }
    }
  }, [poll.id, user]);

  React.useEffect(() => {
    if (user && existingVotes && !isSubmitting) {
      setSelectedOption(initialSelectedOption);
    }
  }, [existingVotes, isSubmitting, initialSelectedOption, user]);

  const hasVoted = user && existingVotes && existingVotes.length > 0;

  const handleSingleVoteChange = (value: string) => setSelectedOption(value);

  const handleMultipleVoteChange = (optionId: string, checked: boolean) => {
    setSelectedOption(prev => {
      const currentSelections = Array.isArray(prev) ? prev : [];
      return checked ? [...currentSelections, optionId] : currentSelections.filter(id => id !== optionId);
    });
  };

  const submitVote = async () => {
    setIsSubmitting(true);
    
    const selectedOptionsArray = Array.isArray(selectedOption) ? selectedOption : [selectedOption as string];
    if (selectedOptionsArray.length === 0 || (selectedOptionsArray.length === 1 && selectedOptionsArray[0] === '')) {
      showError(isSingleChoice ? "Please select an option." : "Please select at least one option.");
      setIsSubmitting(false);
      return;
    }
  
    try {
      const { error } = await supabase.functions.invoke('submit-vote', {
        method: 'POST',
        body: {
          poll_id: poll.id,
          option_ids: selectedOptionsArray,
          voter_name: user ? undefined : anonymousVoterName,
        },
      });
  
      if (error) throw new Error(error.message);
  
      showSuccess('Vote submitted successfully!');
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['userVotes', poll.id, user.id] });
      } else {
        const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '[]');
        localStorage.setItem('voted_polls', JSON.stringify([...votedPolls, poll.id]));
        setHasVotedAnonymously(true);
      }
      queryClient.invalidateQueries({ queryKey: ['pollResults', poll.id] });
  
    } catch (err) {
      console.error('Error submitting vote:', err);
      showError(`Failed to submit vote: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitVote = async () => {
    if (!user && !anonymousVoterName) {
      showError("Cannot vote without providing a name.");
      return;
    }
    await submitVote();
  };

  const renderStatusBadge = () => {
    let statusText: 'Active' | 'Closed';
    let tooltipText: string;

    if (!poll.is_active) {
      statusText = 'Closed';
      tooltipText = 'This poll was manually closed by the creator.';
    } else if (poll.due_at && new Date(poll.due_at) < new Date()) {
      statusText = 'Closed';
      tooltipText = 'This poll is closed because the due date has passed.';
    } else {
      statusText = 'Active';
      tooltipText = 'This poll is currently open for voting.';
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild><Badge variant={statusText === 'Active' ? 'default' : 'destructive'}>{statusText}</Badge></TooltipTrigger>
        <TooltipContent><p>{tooltipText}</p></TooltipContent>
      </Tooltip>
    );
  };

  const isPollActive = poll.is_active && (!poll.due_at || new Date(poll.due_at) > new Date());

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} title="Go Back" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-6 w-6" /></Button>
            <div className="flex items-center gap-2">
              {isPollOwner && (<Tooltip><TooltipTrigger><Star className="h-6 w-6 text-yellow-500 fill-yellow-500 flex-shrink-0" /></TooltipTrigger><TooltipContent><p>Created by You</p></TooltipContent></Tooltip>)}
              <CardTitle className="text-2xl md:text-3xl">{poll.title}</CardTitle>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 md:flex-row md:items-center">
            <div className="flex items-center gap-2">{renderStatusBadge()}</div>
            <div className="flex items-center gap-2">
              {user && <Button variant="outline" size="icon" onClick={() => toggleSavePoll(poll.id)} disabled={isTogglingSave} title={isSaved ? 'Remove from saved polls' : 'Add to saved polls'}><Bookmark className={cn("h-4 w-4", isSaved ? "text-yellow-500 fill-yellow-500" : "")} /></Button>}
              <Button variant="outline" size="icon" onClick={() => navigate(`/polls/${poll.id}/results`)} title="View Results"><BarChart3 className="h-4 w-4" /></Button>
              {isPollOwner && (<Button variant="outline" size="icon" onClick={() => navigate(`/polls/${poll.id}/edit`)} title="Edit Poll"><Pencil className="h-4 w-4" /></Button>)}
            </div>
          </div>
        </div>
        {poll.description && (<CardDescription className="mt-2 text-lg">{poll.description}</CardDescription>)}
        <p className="text-sm text-muted-foreground pt-2">
          Created on: {format(new Date(poll.created_at), 'PPP')}
          {poll.due_at && (<span> | Due: {format(new Date(poll.due_at), 'PPP p')}</span>)}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isRoleLoading || (user && isLoadingVotes) ? (
          <div className="text-center text-muted-foreground">Loading poll status...</div>
        ) : !isPollActive ? (
          <div className="p-4 bg-red-100 text-red-800 rounded-md dark:bg-red-900 dark:text-red-200 text-center">This poll is closed and cannot accept new votes.</div>
        ) : hasVotedAnonymously ? (
          <div className="p-4 bg-green-100 text-green-800 rounded-md dark:bg-green-900 dark:text-green-200 text-center">Thank you for voting!</div>
        ) : (
          <>
            <h3 className="text-xl font-semibold">{hasVoted ? 'Update Your Vote' : 'Cast Your Vote'}</h3>
            {isSingleChoice ? (
              <RadioGroup value={selectedOption as string} onValueChange={handleSingleVoteChange} className="space-y-3" disabled={isSubmitting}>
                {poll.options.map((option) => (
                  <label key={option.id} htmlFor={option.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary has-[:checked]:shadow-md">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <span className="text-base font-medium flex-grow">{option.text}</span>
                  </label>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                {poll.options.map((option) => {
                  const currentSelections = Array.isArray(selectedOption) ? selectedOption : [];
                  const isChecked = currentSelections.includes(option.id);
                  return (
                    <label key={option.id} htmlFor={option.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary has-[:checked]:shadow-md">
                      <Checkbox id={option.id} checked={isChecked} onCheckedChange={(checked) => handleMultipleVoteChange(option.id, checked as boolean)} disabled={isSubmitting} />
                      <span className="text-base font-medium flex-grow">{option.text}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <Button onClick={handleSubmitVote} className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : hasVoted ? 'Update Vote' : 'Submit Vote'}
            </Button>
            {hasVoted && (<p className="text-sm text-green-600 dark:text-green-400 text-center">You have already voted in this poll. You can change your selection above.</p>)}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PollDetailView;