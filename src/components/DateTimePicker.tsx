import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, setHours, setMinutes, setSeconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface DateTimePickerProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  label: string;
  disabled?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, label, disabled }) => {
  const [date, setDate] = useState<Date | undefined>(value || undefined);
  const [time, setTime] = useState<string>(value ? format(value, 'HH:mm') : '');

  useEffect(() => {
    setDate(value || undefined);
    setTime(value ? format(value, 'HH:mm') : '');
  }, [value]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      // If time is set, combine date and time
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        const combinedDate = setMinutes(setHours(newDate, hours), minutes);
        onChange(combinedDate);
      } else {
        // If no time is set, default to midnight of that day
        const combinedDate = setSeconds(setMinutes(setHours(newDate, 0), 0), 0);
        onChange(combinedDate);
      }
    } else {
      onChange(null);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (date && newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      if (hours !== undefined && minutes !== undefined) {
        const combinedDate = setMinutes(setHours(date, hours), minutes);
        onChange(combinedDate);
      }
    } else if (date) {
      // If time is cleared, reset to midnight of the selected date
      const combinedDate = setSeconds(setMinutes(setHours(date, 0), 0), 0);
      onChange(combinedDate);
    }
  };

  const displayValue = date ? format(date, 'PPP') : label;

  return (
    <div className="flex flex-col space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{displayValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            // Disable past dates, but allow selecting today if the time hasn't passed yet (handled by Zod validation)
            disabled={(date) => date < new Date() && date.toDateString() !== new Date().toDateString()}
          />
        </PopoverContent>
      </Popover>
      <div className="relative">
        <Input
          type="time"
          value={time}
          onChange={handleTimeChange}
          className="pl-10"
          disabled={disabled || !date}
        />
        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};

export default DateTimePicker;