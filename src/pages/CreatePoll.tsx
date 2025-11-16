import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { supabase } from '@/integrations/supabase/client';
import PollForm, { PollFormValues } from '@/components/PollForm';
import { showSuccess, showError } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';

const CreatePoll: React.FC = () => {
  const { user } = useSupabaseSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PollFormValues) => {
    if (!user) {
      showError("You must be logged in to create a poll.");
      return;
    }

    setIsSubmitting(true);

    const { title, description, poll_type, options, is_active, due_at } = data;

    // Ensure options are clean (remove empty strings)
    const cleanOptions = options.filter(opt => opt.text.trim() !== '');

    if (cleanOptions.length < 2) {
        showError("Please provide at least two valid options.");
        setIsSubmitting(false);
        return;
    }

    const payload = {
      title: title.trim(),
      description: description?.trim() || null,
      poll_type,
      options: cleanOptions,
      is_active,
      // Convert Date object to ISO string for Supabase
      due_at: due_at ? due_at.toISOString() : null,
    };

    try {
      // Call the Edge Function (API endpoint)
      const response = await supabase.functions.invoke('create-poll', {
        method: 'POST',
        body: payload,
      });

      if (response.error) {
        throw response.error;
      }

      const responseData = response.data as { message: string, pollId: string };

      showSuccess('Poll created successfully!');
      // Invalidate the polls query so the list updates immediately
      queryClient.invalidateQueries({ queryKey: ['polls'] }); 
      
      // Redirect to the new poll detail page
      navigate(`/polls/${responseData.pollId}`); 

    } catch (error) {
      console.error('Error creating poll via API:', error);
      showError('Failed to create poll. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create New Poll</h1>
        <p className="text-muted-foreground">Fill out the details below to create your poll.</p>
      </div>
      <PollForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CreatePoll;