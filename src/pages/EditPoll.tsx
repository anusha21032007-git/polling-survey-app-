import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PollForm, { PollFormValues } from '@/components/PollForm';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { usePoll } from '@/hooks/use-poll';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUserId } from '@/hooks/use-current-user-id';
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
import { Button } from '@/components/ui/button';

const EditPoll: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const pollId = id || '';
  const { data: poll, isLoading, isError } = usePoll(pollId);
  const currentUserId = useCurrentUserId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4"><Skeleton className="h-96 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !poll) {
    return <div className="max-w-3xl mx-auto text-destructive p-6">Error loading poll or poll not found.</div>;
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
    const { title, description, poll_type, options, is_active, due_at } = data;
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
      due_at: due_at ? due_at.toISOString() : null,
    };

    const { error } = await supabase.from('polls').update(updatedPoll).eq('id', pollId);
    setIsSubmitting(false);

    if (error) {
      console.error('Error updating poll:', error);
      showError('Failed to update poll. Please try again.');
    } else {
      showSuccess('Poll updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] }); 
      queryClient.invalidateQueries({ queryKey: ['polls'] }); 
      navigate(`/polls/${pollId}`); 
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from('polls').delete().eq('id', pollId);
    setIsDeleting(false);

    if (error) {
      console.error('Error deleting poll:', error);
      showError('Failed to delete poll. Please try again.');
    } else {
      showSuccess('Poll deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      navigate('/');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="space-y-2">
        <h1 className="text-3xl font-bold">Edit Poll</h1>
        <p className="text-muted-foreground truncate">Editing: {poll.title}</p>
      </div>
      <AlertDialog>
        <PollForm 
          poll={poll} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          deleteAction={
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={isSubmitting || isDeleting}>
                Delete Poll
              </Button>
            </AlertDialogTrigger>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this poll and all of its associated votes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirm Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditPoll;