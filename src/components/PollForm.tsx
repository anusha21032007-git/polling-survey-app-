import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, CalendarIcon } from 'lucide-react';
import { Poll } from '@/types/poll';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Utility to generate a simple unique ID for form options
const generateOptionId = () => Math.random().toString(36).substring(2, 9);

const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text is required").max(200, "Option text must be 200 characters or less."),
});

const formSchema = z.object({
  title: z.string().min(5, "Poll Question must be at least 5 characters.").max(500, "Poll Question must be 500 characters or less."),
  description: z.string().max(1000, "Description must be 1000 characters or less.").optional().or(z.literal('')),
  poll_type: z.enum(['single', 'multiple']),
  options: z.array(optionSchema).min(2, "A poll must have at least two options."),
  is_active: z.boolean().default(true),
  starts_at: z.date().optional().nullable(),
  ends_at: z.date().optional().nullable(),
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

  // Validation for start/end dates
  if (data.starts_at && data.ends_at && data.starts_at >= data.ends_at) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after the start date.",
      path: ['ends_at'],
    });
  }
});

export type PollFormValues = z.infer<typeof formSchema>;

interface PollFormProps {
  poll?: Poll; // Optional poll data for editing
  onSubmit: (data: PollFormValues) => void;
  isSubmitting: boolean;
  onDelete?: () => void; // Optional delete handler
  isDeleting?: boolean;
}

const PollForm: React.FC<PollFormProps> = ({ poll, onSubmit, isSubmitting, onDelete, isDeleting }) => {
  
  const defaultValues: PollFormValues = {
    title: poll?.title || "",
    description: poll?.description || "",
    poll_type: poll?.poll_type || 'single',
    options: poll?.options || [
      { id: generateOptionId(), text: "" },
      { id: generateOptionId(), text: "" },
    ],
    is_active: poll?.is_active ?? true,
    starts_at: poll?.starts_at ? new Date(poll.starts_at) : null,
    ends_at: poll?.ends_at ? new Date(poll.ends_at) : null,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Title / Poll Question */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Poll Question</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., What is your favorite color?" {...field} rows={3} />
              </FormControl>
              <FormDescription>The main question for your poll. Max 500 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide more context for your poll." {...field} />
              </FormControl>
              <FormDescription>Max 1000 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Poll Type */}
        <FormField
          control={form.control}
          name="poll_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg">Voting Options</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="single" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Single Choice (Voters can only pick one option)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="multiple" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Multiple Choice (Voters can pick multiple options)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Poll Options</h3>
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name={`options.${index}.text`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder={`Option ${index + 1} (Max 200 chars)`} {...field} />
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
        </div>
        
        {/* Scheduling and Active Status */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Scheduling & Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="starts_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a start date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ends_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick an end date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          {poll && onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={isSubmitting || isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Poll"}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || isDeleting}>
            {isSubmitting ? (poll ? "Saving..." : "Posting...") : (poll ? "Save Changes" : "Post Poll")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PollForm;