import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { supabase } from '@/integrations/supabase/client';
import PollForm, { PollFormValues } from '@/components/PollForm';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    const { title, description, poll_type, options, is_active, starts_at, ends_at } = data;

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
      // Convert Date objects to ISO strings for Supabase
      starts_at: starts_at ? starts_at.toISOString() : null,
      ends_at: ends_at ? ends_at.toISOString() : null,
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
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Poll</CardTitle>
        </CardHeader>
        <CardContent>
          <PollForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePoll;