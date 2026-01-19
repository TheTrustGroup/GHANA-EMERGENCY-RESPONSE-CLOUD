'use client';

/**
 * Enhanced Theme Toggle Component
 * Improved visibility, smooth transitions, and better UX
 */

import { Moon, Sun, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/accessibility/keyboard';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const reducedMotion = prefersReducedMotion();

  const iconVariants = reducedMotion
    ? {}
    : {
        initial: { scale: 1, rotate: 0 },
        animate: { scale: [1, 1.2, 1], rotate: [0, 180, 360] },
        transition: { duration: 0.5 },
      };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2 transition-all duration-200',
            'hover:bg-accent hover:text-accent-foreground',
            'focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'border-2'
          )}
          aria-label={`Current theme: ${resolvedTheme}. Click to change theme`}
        >
          {resolvedTheme === 'light' ? (
            <motion.div
              key="sun"
              {...iconVariants}
              className="flex items-center justify-center"
            >
              <Sun className="h-4 w-4" aria-hidden="true" />
            </motion.div>
          ) : resolvedTheme === 'dark' ? (
            <motion.div
              key="moon"
              {...iconVariants}
              className="flex items-center justify-center"
            >
              <Moon className="h-4 w-4" aria-hidden="true" />
            </motion.div>
          ) : (
            <motion.div
              key="monitor"
              {...iconVariants}
              className="flex items-center justify-center"
            >
              <Monitor className="h-4 w-4" aria-hidden="true" />
            </motion.div>
          )}
          <span className="hidden sm:inline font-medium">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[140px] transition-all duration-200"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'cursor-pointer transition-colors',
            theme === 'light' && 'bg-accent font-semibold'
          )}
        >
          <Sun className="h-4 w-4 mr-2" aria-hidden="true" />
          <span>Light</span>
          {theme === 'light' && (
            <CheckCircle className="h-4 w-4 ml-auto" aria-hidden="true" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'cursor-pointer transition-colors',
            theme === 'dark' && 'bg-accent font-semibold'
          )}
        >
          <Moon className="h-4 w-4 mr-2" aria-hidden="true" />
          <span>Dark</span>
          {theme === 'dark' && (
            <CheckCircle className="h-4 w-4 ml-auto" aria-hidden="true" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            'cursor-pointer transition-colors',
            theme === 'system' && 'bg-accent font-semibold'
          )}
        >
          <Monitor className="h-4 w-4 mr-2" aria-hidden="true" />
          <span>System</span>
          {theme === 'system' && (
            <CheckCircle className="h-4 w-4 ml-auto" aria-hidden="true" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { CheckCircle } from 'lucide-react';
