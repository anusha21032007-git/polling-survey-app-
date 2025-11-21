import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import { Poll } from '@/types/poll';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DateTimePicker from './DateTimePicker';

// Utility to generate a simple unique ID for form options
const generateOptionId = () => Math.random().toString(36).substring(2, 9);

const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text is required").max(200, "Option text must be 200 characters or less."),
});

const formSchema = z.object({
  title: z.string().min(5, "Poll Title must be at least 5 characters.").max(500, "Poll Title must be 500 characters or less."),
  description: z.string().max(1000, "Description must be 1000 characters or less.").optional().or(z.literal('')),
  poll_type: z.enum(['single', 'multiple']),
  options: z.array(optionSchema).min(2, "A poll must have at least two options."),
  is_active: z.boolean().default(true),
  due_at: z.date().optional().nullable(),
}).superRefine((data, ctx) => {
  // Custom validation for unique options
  const optionTexts = data.options.map(opt => opt.text.trim().toLowerCase()).filter(text => text.length > 0);
  const uniqueOptionTexts = new Set(optionTexts);

  if (optionTexts.length !== uniqueOptionTexts.size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "All poll options must be unique.",
      path: ['options'],
    });
  }

  // Validation for due date/time: must be in the future if set
  if (data.due_at && data.due_at <= new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Due date and time must be in the future.",
      path: ['due_at'],
    });
  }
});

export type PollFormValues = z.infer<typeof formSchema>;

interface PollFormProps {
  poll?: Poll; // Optional poll data for editing
  onSubmit: (data: PollFormValues) => void;
  isSubmitting: boolean;
  deleteAction?: React.ReactNode; // Optional delete action component
  isDeleting?: boolean;
}

const PollForm: React.FC<PollFormProps> = ({ poll, onSubmit, isSubmitting, deleteAction, isDeleting }) => {
  
  const defaultValues: PollFormValues = {
    title: poll?.title || "",
    description: poll?.description || "",
    poll_type: poll?.poll_type || 'single',
    options: poll?.options || [
      { id: generateOptionId(), text: "" },
      { id: generateOptionId(), text: "" },
    ],
    is_active: poll?.is_active ?? true,
    due_at: poll?.due_at ? new Date(poll.due_at) : null,
  };

  const form = useForm<PollFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const handleAddOption = () => {
    append({ id: generateOptionId(), text: "" });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Poll Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Poll Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poll Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., What is your favorite color?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Briefly describe what this poll is about..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Options Card */}
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription>{fields.length} options added</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name={`options.${index}.text`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input placeholder={`Option ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label={`Remove option ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddOption} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Option
            </Button>
            {form.formState.errors.options && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.options.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="poll_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Voting Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="single" /></FormControl>
                        <FormLabel className="font-normal">Single Choice</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="multiple" /></FormControl>
                        <FormLabel className="font-normal">Multiple Choice</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="due_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date & Time (Optional)</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      label="Pick a due date and time"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Voting will automatically close after this date and time.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-4">
          {poll && deleteAction}
          <Button type="submit" disabled={isSubmitting || isDeleting}>
            {isSubmitting ? (poll ? "Saving..." : "Posting...") : (poll ? "Save Changes" : "Post Poll")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PollForm;