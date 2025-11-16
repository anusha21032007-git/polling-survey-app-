import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { supabase } from '@/integrations/supabase/client';
import PollForm, { PollFormValues } from '@/components/PollForm';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { usePoll } from '@/hooks/use-poll';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUserId } from '@/hooks/use-current-user-id';

const EditPoll: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const pollId = id || '';
  const { data: poll, isLoading, isError, error } = usePoll(pollId);
  const currentUserId = useCurrentUserId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !poll) {
    return (
      <div className="max-w-3xl mx-auto text-destructive p-6">
        Error loading poll or poll not found.
      </div>
    );
  }
  
  if (currentUserId !== poll.user_id) {
    return (
      <div className="max-w-3xl mx-auto text-center p-10 border rounded-lg bg-destructive/10 text-destructive">
        <p className="text-lg">You do not have permission to edit this poll.</p>
      </div>
    );
  }

  const handleSubmit = async (data: PollFormValues) => {
    setIsSubmitting(true);

    const { title, description, poll_type, options, is_active, starts_at, ends_at } = data;

    // Ensure options are clean (remove empty strings)
    const cleanOptions = options.filter(opt => opt.text.trim() !== '');

    if (cleanOptions.length < 2) {
        showError("Please provide at least two valid options.");
        setIsSubmitting(false);
        return;
    }

    const updatedPoll = {
      title: title.trim(),
      description: description?.trim() || null,
      poll_type,
      options: cleanOptions,
      is_active,
      // Convert Date objects to ISO strings for Supabase
      starts_at: starts_at ? starts_at.toISOString() : null,
      ends_at: ends_at ? ends_at.toISOString() : null,
    };

    const { error } = await supabase
      .from('polls')
      .update(updatedPoll)
      .eq('id', pollId);

    setIsSubmitting(false);

    if (error) {
      console.error('Error updating poll:', error);
      showError('Failed to update poll. Please try again.');
    } else {
      showSuccess('Poll updated successfully!');
      // Invalidate queries for the specific poll and the list
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] }); 
      queryClient.invalidateQueries({ queryKey: ['polls'] }); 
      navigate(`/polls/${pollId}`); 
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Poll: {poll.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <PollForm 
            poll={poll} 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPoll;