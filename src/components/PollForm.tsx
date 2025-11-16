import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import { PollOption } from '@/types/poll';

// Utility to generate a simple unique ID for form options
const generateOptionId = () => Math.random().toString(36).substring(2, 9);

const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text is required"),
});

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().optional(),
  poll_type: z.enum(['single', 'multiple']),
  options: z.array(optionSchema).min(2, "A poll must have at least two options."),
});

export type PollFormValues = z.infer<typeof formSchema>;

interface PollFormProps {
  onSubmit: (data: PollFormValues) => void;
  isSubmitting: boolean;
}

const PollForm: React.FC<PollFormProps> = ({ onSubmit, isSubmitting }) => {
  const form = useForm<PollFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      poll_type: 'single',
      options: [
        { id: generateOptionId(), text: "" },
        { id: generateOptionId(), text: "" },
      ],
    },
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
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poll Question/Title</FormLabel>
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
                <Textarea placeholder="Provide more context for your poll." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="poll_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Poll Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="single" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Single Choice (Voters can select only one option)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="multiple" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Multiple Choice (Voters can select several options)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Options</h3>
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
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Poll..." : "Create Poll"}
        </Button>
      </form>
    </Form>
  );
};

export default PollForm;