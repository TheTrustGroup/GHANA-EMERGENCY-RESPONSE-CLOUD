'use client';

/**
 * DateRangePicker Component
 * Date range selector with presets and custom range
 */

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// Calendar component would need to be created or use a date picker library
// import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

export type DateRange = {
  from: Date;
  to: Date;
};

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  compareToPrevious?: boolean;
  onCompareToggle?: (enabled: boolean) => void;
  className?: string;
}

const presets = [
  {
    label: 'Today',
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
      };
    },
  },
  {
    label: 'Last 7 Days',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 7)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 30 Days',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 30)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 90 Days',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 90)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'This Month',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Last Month',
    getValue: () => {
      const lastMonth = subDays(startOfMonth(new Date()), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
];

export function DateRangePicker({
  value,
  onChange,
  compareToPrevious = false,
  onCompareToggle,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const handlePresetSelect = (presetLabel: string) => {
    const preset = presets.find((p) => p.label === presetLabel);
    if (preset) {
      onChange(preset.getValue());
      setSelectedPreset(presetLabel);
      setIsOpen(false);
    }
  };

  // Date selection handler - reserved for future calendar component integration
  // const handleDateSelect = (date: Date | undefined) => {
  //   if (!date) return;
  //   if (!value.from || (value.from && value.to)) {
  //     onChange({ from: date, to: date });
  //   } else if (value.from && !value.to) {
  //     if (date < value.from) {
  //       onChange({ from: date, to: value.from });
  //     } else {
  //       onChange({ from: value.from, to: date });
  //     }
  //     setIsOpen(false);
  //   }
  // };

  const formatRange = () => {
    if (!value.from) return 'Select date range';
    if (!value.to) return format(value.from, 'PPP');
    return `${format(value.from, 'MMM d')} - ${format(value.to, 'MMM d, yyyy')}`;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            <div className="space-y-2 mb-4">
              <Label>Quick Select</Label>
              <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preset" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.label} value={preset.label}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Calendar component - would need to be implemented or use a library */}
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Custom date range selection coming soon. Use presets above.
              </p>
              <div className="text-sm">
                <p>From: {format(value.from, 'PPP')}</p>
                <p>To: {format(value.to, 'PPP')}</p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {onCompareToggle && (
        <div className="flex items-center gap-2">
          <Switch
            id="compare"
            checked={compareToPrevious}
            onCheckedChange={onCompareToggle}
          />
          <Label htmlFor="compare" className="text-sm">
            Compare to previous period
          </Label>
        </div>
      )}
    </div>
  );
}

