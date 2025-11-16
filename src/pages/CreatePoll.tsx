import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { supabase } from '@/integrations/supabase/client';
import PollForm, { PollFormValues } from '@/components/PollForm';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CreatePoll: React.FC = () => {
  const { user } = useSupabaseSession();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PollFormValues) => {
    if (!user) {
      showError("You must be logged in to create a poll.");
      return;
    }

    setIsSubmitting(true);

    const { title, description, poll_type, options } = data;

    // Ensure options are clean (remove empty strings)
    const cleanOptions = options.filter(opt => opt.text.trim() !== '');

    if (cleanOptions.length < 2) {
        showError("Please provide at least two valid options.");
        setIsSubmitting(false);
        return;
    }

    const newPoll = {
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      poll_type,
      options: cleanOptions,
    };

    const { error } = await supabase
      .from('polls')
      .insert([newPoll]);

    setIsSubmitting(false);

    if (error) {
      console.error('Error creating poll:', error);
      showError('Failed to create poll. Please try again.');
    } else {
      showSuccess('Poll created successfully!');
      navigate('/'); 
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