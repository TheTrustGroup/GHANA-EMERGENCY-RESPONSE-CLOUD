'use client';

/**
 * useResponsive Hook
 * Custom hook for responsive breakpoint detection
 * Returns boolean values for different screen sizes
 */

import { useEffect, useState } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: > 1024px
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Set initial state
    updateState();

    // Add event listener
    window.addEventListener('resize', updateState);

    // Cleanup
    return () => window.removeEventListener('resize', updateState);
  }, []);

  return state;
}

