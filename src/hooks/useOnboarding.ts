/**
 * useOnboarding Hook
 * Hook to manage onboarding state and check if onboarding should be shown
 */

import { useState, useEffect } from 'react';

interface UseOnboardingOptions {
  storageKey: string;
  enabled?: boolean;
}

export function useOnboarding({ storageKey, enabled = true }: UseOnboardingOptions) {
  const [hasCompleted, setHasCompleted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const completed = localStorage.getItem(storageKey);
    setHasCompleted(!!completed);
    setIsLoading(false);
  }, [storageKey, enabled]);

  const markComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
      setHasCompleted(true);
    }
  };

  const reset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
      setHasCompleted(false);
    }
  };

  return {
    hasCompleted,
    isLoading,
    markComplete,
    reset,
    shouldShow: !hasCompleted && enabled,
  };
}
