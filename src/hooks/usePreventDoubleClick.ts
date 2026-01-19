/**
 * Hook to prevent double-clicks and race conditions
 * Ensures buttons are disabled during async operations
 */

import { useState, useCallback, useRef } from 'react';

interface UsePreventDoubleClickOptions {
  delay?: number; // Minimum delay between clicks (ms)
  onAction: () => Promise<void> | void;
}

export function usePreventDoubleClick({ delay = 500, onAction }: UsePreventDoubleClickOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const lastClickTime = useRef<number>(0);
  const isProcessing = useRef<boolean>(false);

  const handleClick = useCallback(async () => {
    const now = Date.now();
    
    // Prevent rapid clicks
    if (now - lastClickTime.current < delay) {
      return;
    }

    // Prevent concurrent executions
    if (isProcessing.current) {
      return;
    }

    lastClickTime.current = now;
    isProcessing.current = true;
    setIsLoading(true);

    try {
      await onAction();
    } catch (error) {
      console.error('Action error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      isProcessing.current = false;
    }
  }, [onAction, delay]);

  return {
    handleClick,
    isLoading,
    disabled: isLoading,
  };
}
