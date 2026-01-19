'use client';

/**
 * Help Button Component
 * Contextual help button with popover
 */

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpButtonProps {
  title: string;
  content: string | React.ReactNode;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

export function HelpButton({
  title,
  content,
  className,
  variant = 'ghost',
  size = 'default',
}: HelpButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('h-auto p-1', className)}
          aria-label={`Help: ${title}`}
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm">{title}</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setOpen(false)}
              aria-label="Close help"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {typeof content === 'string' ? <p>{content}</p> : content}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
