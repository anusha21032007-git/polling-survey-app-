import React, { useState } from 'react';
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
import { Pencil, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';

interface PollDetailViewProps {
  poll: Poll;
}

const PollDetailView: React.FC<PollDetailViewProps> = ({ poll }) => {
  const { user } = useSupabaseSession();
  const { isLoading: isRoleLoading } = useUserRole();
  const currentUserId = useCurrentUserId();
  const isPollOwner = currentUserId === poll.user_id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: existingVotes, isLoading: isLoadingVotes } = useUserVote(poll.id);
  
  const isSingleChoice = poll.poll_type === 'single';

  // Initialize selectedOption based on existing votes or default empty state
  const initialSelectedOption = React.useMemo(() => {
    if (existingVotes) {
      return isSingleChoice 
        ? existingVotes[0]?.option_id || '' 
        : existingVotes.map(v => v.option_id);
    }
    return isSingleChoice ? '' : [];
  }, [existingVotes, isSingleChoice]);

  const [selectedOption, setSelectedOption] = useState<string | string[]>(initialSelectedOption);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update state when existingVotes changes (e.g., after a successful submission)
  React.useEffect(() => {
    if (existingVotes && !isSubmitting) {
      setSelectedOption(initialSelectedOption);
    }
  }, [existingVotes, isSubmitting, initialSelectedOption]);

  const hasVoted = existingVotes && existingVotes.length > 0;

  const handleSingleVoteChange = (value: string) => {
    setSelectedOption(value);
  };

  const handleMultipleVoteChange = (optionId: string, checked: boolean) => {
    setSelectedOption(prev => {
      const currentSelections = Array.isArray(prev) ? prev : [];
      if (checked) {
        return [...currentSelections, optionId];
      } else {
        return currentSelections.filter(id => id !== optionId);
      }
    });
  };

  const handleSubmitVote = async () => {
    if (!user) {
      showError("You must be logged in to vote.");
      return;
    }

    let votesToInsert: { user_id: string; poll_id: string; option_id: string }[] = [];
    
    if (isSingleChoice) {
      if (!selectedOption) {
        showError("Please select an option.");
        return;
      }
      votesToInsert = [{ 
        user_id: user.id, 
        poll_id: poll.id, 
        option_id: selectedOption as string 
      }];
    } else {
      const selectedOptions = Array.isArray(selectedOption) ? selectedOption : [];
      if (selectedOptions.length === 0) {
        showError("Please select at least one option.");
        return;
      }
      votesToInsert = selectedOptions.map(option_id => ({
        user_id: user.id,
        poll_id: poll.id,
        option_id,
      }));
    }

    setIsSubmitting(true);

    // 1. Delete existing votes for this user/poll combination (for idempotency/updating vote)
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('poll_id', poll.id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting old votes:', deleteError);
      showError('Failed to update vote. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // 2. Insert new votes
    const { error: insertError } = await supabase
      .from('votes')
      .insert(votesToInsert);

    setIsSubmitting(false);

    if (insertError) {
      console.error('Error inserting new votes:', insertError);
      showError('Failed to submit vote. Please try again.');
    } else {
      showSuccess('Vote submitted successfully!');
      // Invalidate user votes query to update UI
      queryClient.invalidateQueries({ queryKey: ['userVotes', poll.id, user.id] });
      // Invalidate poll results query to update results immediately if viewed
      queryClient.invalidateQueries({ queryKey: ['pollResults', poll.id] });
    }
  };

  const renderStatusBadge = () => {
    if (!poll.is_active) {
      return <Badge variant="destructive">Closed (Manually)</Badge>;
    }
    if (poll.due_at && new Date(poll.due_at) < new Date()) {
      return <Badge variant="destructive">Closed (Expired)</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const isPollActive = poll.is_active && (!poll.due_at || new Date(poll.due_at) > new Date());

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-3xl">{poll.title}</CardTitle>
          <div className="flex space-x-2">
            {/* Status and type badges are always shown */}
            {renderStatusBadge()}
            <Badge variant="secondary" className="capitalize">
              {isSingleChoice ? 'Single Choice' : 'Multiple Choice'}
            </Badge>
            
            {/* Results Button */}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(`/polls/${poll.id}/results`)}
              title="View Results"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>

            {/* Edit Button (Owner only) */}
            {isPollOwner && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate(`/polls/${poll.id}/edit`)}
                title="Edit Poll"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {poll.description && (
          <CardDescription className="mt-2 text-lg">{poll.description}</CardDescription>
        )}
        <p className="text-sm text-muted-foreground pt-2">
          Created on: {format(new Date(poll.created_at), 'PPP')}
          {poll.due_at && (
            <span> | Due: {format(new Date(poll.due_at), 'PPP p')}</span>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isRoleLoading || isLoadingVotes ? (
          <div className="text-center text-muted-foreground">Loading poll status...</div>
        ) : !isPollActive ? (
          <div className="p-4 bg-red-100 text-red-800 rounded-md dark:bg-red-900 dark:text-red-200">
            This poll is closed and cannot accept new votes.
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold">
              {hasVoted ? 'Update Your Vote' : 'Cast Your Vote'}
            </h3>
            
            {/* Render options for voting */}
            {isSingleChoice ? (
              <RadioGroup
                value={selectedOption as string}
                onValueChange={(value) => setSelectedOption(value)}
                className="space-y-3"
                disabled={!poll.is_active || isSubmitting || isLoadingVotes}
              >
                {poll.options.map((option) => (
                  <label
                    key={option.id}
                    htmlFor={option.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary has-[:checked]:shadow-md"
                  >
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
                    <label
                      key={option.id}
                      htmlFor={option.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary has-[:checked]:shadow-md"
                    >
                      <Checkbox
                        id={option.id}
                        checked={isChecked}
                        onCheckedChange={(checked) => handleMultipleVoteChange(option.id, checked as boolean)}
                        disabled={!poll.is_active || isSubmitting || isLoadingVotes}
                      />
                      <span className="text-base font-medium flex-grow">{option.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <Button 
              onClick={handleSubmitVote} 
              className="w-full" 
              disabled={isSubmitting || isLoadingVotes || !isPollActive}
            >
              {isSubmitting ? 'Submitting...' : hasVoted ? 'Update Vote' : 'Submit Vote'}
            </Button>
            
            {hasVoted && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                You have already voted in this poll. You can change your selection above.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PollDetailView;