import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSupabaseSession } from "@/integrations/supabase/session-context";
import PollList from "@/components/PollList";
import { useUserRole } from "@/hooks/use-user-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PollForm, { PollFormValues } from "@/components/PollForm";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";

const Index = () => {
  const { user } = useSupabaseSession();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const queryClient = useQueryClient();
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isRoleLoading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  const userName = user?.email || "User";

  const handleCreatePoll = async (data: PollFormValues) => {
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

    const newPoll = {
      user_id: user.id,
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
      .insert([newPoll]);

    setIsSubmitting(false);

    if (error) {
      console.error('Error creating poll:', error);
      showError('Failed to create poll. Please try again.');
    } else {
      showSuccess('Poll created successfully!');
      // Invalidate the polls query so the list updates immediately
      queryClient.invalidateQueries({ queryKey: ['polls'] }); 
      setIsCreatingPoll(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {userName.split('@')[0]}! 
          {role === 'admin' && <span className="text-sm text-muted-foreground ml-2">(Admin View)</span>}
        </h1>
      </div>
      
      {role === 'user' ? (
        <>
          <h2 className="text-2xl font-semibold mb-6">Available Polls</h2>
          <PollList />
        </>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
            {!isCreatingPoll && (
              <Button onClick={() => setIsCreatingPoll(true)}>
                Create New Poll
              </Button>
            )}
          </div>
          
          {isCreatingPoll ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Poll</CardTitle>
              </CardHeader>
              <CardContent>
                <PollForm 
                  onSubmit={handleCreatePoll} 
                  isSubmitting={isSubmitting} 
                />
                <div className="mt-4 flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreatingPoll(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg bg-muted/50 p-8 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Use the button above to create a new poll.
              </p>
              <p className="text-muted-foreground">
                You can create polls with questions, descriptions, multiple options, and schedule them for specific dates.
              </p>
            </div>
          )}
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Existing Polls</h3>
            <PollList />
          </div>
        </div>
      )}

      <MadeWithDyad />
    </div>
  );
};

export default Index;
