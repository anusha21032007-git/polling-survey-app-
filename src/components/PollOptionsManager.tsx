import React from 'react';
import { useFieldArray, Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';

// Utility to generate a simple unique ID for form options
const generateOptionId = () => Math.random().toString(36).substring(2, 9);

interface PollOptionsManagerProps {
  pollIndex: number;
  control: Control<any>;
}

const PollOptionsManager: React.FC<PollOptionsManagerProps> = ({ pollIndex, control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `polls.${pollIndex}.options`,
  });

  const handleAddOption = () => {
    append({ id: generateOptionId(), text: "" });
  };

  return (
    <div className="space-y-4">
      {fields.map((item, index) => (
        <div key={item.id} className="flex items-center space-x-2">
          <FormField
            control={control}
            name={`polls.${pollIndex}.options.${index}.text`}
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
    </div>
  );
};

export default PollOptionsManager;