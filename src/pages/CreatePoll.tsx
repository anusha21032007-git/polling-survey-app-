import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DateTimePicker from '@/components/DateTimePicker';
import PollOptionsManager from '@/components/PollOptionsManager';

const generateOptionId = () => Math.random().toString(36).substring(2, 9);

const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text is required").max(200, "Option text must be 200 characters or less."),
});

const pollSchema = z.object({
  title: z.string().min(5, "Poll question must be at least 5 characters.").max(500, "Poll question must be 500 characters or less."),
  description: z.string().max(1000, "Description must be 1000 characters or less.").optional().or(z.literal('')),
  poll_type: z.enum(['single', 'multiple']),
  options: z.array(optionSchema).min(2, "A poll must have at least two options."),
  is_active: z.boolean().default(true),
  due_at: z.date().optional().nullable(),
}).superRefine((data, ctx) => {
  const optionTexts = data.options.map(opt => opt.text.trim().toLowerCase()).filter(text => text.length > 0);
  if (new Set(optionTexts).size !== optionTexts.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "All poll options must be unique.", path: ['options'] });
  }
  if (data.due_at && data.due_at <= new Date()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Due date and time must be in the future.", path: ['due_at'] });
  }
});

const pollSetFormSchema = z.object({
  setTitle: z.string().min(5, "Set Title must be at least 5 characters.").max(200, "Set Title must be 200 characters or less."),
  setDescription: z.string().max(1000, "Description must be 1000 characters or less.").optional().or(z.literal('')),
  polls: z.array(pollSchema).min(1, "You must create at least one poll."),
});

type PollSetFormValues = z.infer<typeof pollSetFormSchema>;

const createDefaultPollValue = () => ({
  title: "", description: "", poll_type: 'single' as const,
  options: [{ id: generateOptionId(), text: "" }, { id: generateOptionId(), text: "" }],
  is_active: true, due_at: null,
});

const CreatePoll: React.FC = () => {
  const { user } = useSupabaseSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PollSetFormValues>({
    resolver: zodResolver(pollSetFormSchema),
    defaultValues: { setTitle: "", setDescription: "", polls: [createDefaultPollValue()] },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "polls" });
  const handleAddPoll = () => append(createDefaultPollValue());

  const handleSubmit = async (data: PollSetFormValues) => {
    if (!user) {
      showError("You must be logged in to create polls.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('create-poll-set', {
        method: 'POST',
        body: data,
      });
      if (error) throw error;
      showSuccess('Poll set created successfully!');
      queryClient.invalidateQueries({ queryKey: ['poll_sets'] });
      navigate('/');
    } catch (error) {
      console.error('Error creating poll set:', error);
      showError(`Failed to create poll set: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create New Poll Set</h1>
        <p className="text-muted-foreground">Group multiple polls into a single, shareable set.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Poll Set Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="setTitle" render={({ field }) => (
                <FormItem><FormLabel>Set Title</FormLabel><FormControl><Input placeholder="e.g., Weekly Team Check-in" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="setDescription" render={({ field }) => (
                <FormItem><FormLabel>Set Description (Optional)</FormLabel><FormControl><Textarea placeholder="What is this set of polls about?" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          {fields.map((field, index) => (
            <Card key={field.id} className="relative pt-8 border-2 border-dashed">
              {fields.length > 1 && (
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="absolute top-2 right-2" aria-label={`Remove poll ${index + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <CardHeader><CardTitle>Poll #{index + 1}</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name={`polls.${index}.title`} render={({ field }) => (
                  <FormItem><FormLabel>Poll Question</FormLabel><FormControl><Input placeholder="e.g., How was your week?" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`polls.${index}.description`} render={({ field }) => (
                  <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Add more context to this question..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div>
                  <FormLabel>Options</FormLabel>
                  <PollOptionsManager pollIndex={index} control={form.control} />
                  <FormMessage>{form.formState.errors.polls?.[index]?.options?.message}</FormMessage>
                  <FormMessage>{form.formState.errors.polls?.[index]?.options?.root?.message}</FormMessage>
                </div>
                <FormField control={form.control} name={`polls.${index}.poll_type`} render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel>Voting Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="single" /></FormControl><FormLabel className="font-normal">Single Choice</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="multiple" /></FormControl><FormLabel className="font-normal">Multiple Choice</FormLabel></FormItem>
                  </RadioGroup></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`polls.${index}.due_at`} render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Due Date & Time (Optional)</FormLabel><FormControl><DateTimePicker label="Pick a due date and time" value={field.value} onChange={field.onChange} /></FormControl><FormDescription>Voting will automatically close after this time.</FormDescription><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
          ))}
          
          <Button type="button" variant="outline" onClick={handleAddPoll} className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Another Poll</Button>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Posting..." : `Post ${fields.length} Poll(s)`}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreatePoll;