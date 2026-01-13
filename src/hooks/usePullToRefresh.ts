import { useEffect, useRef, useState } from 'react';

/**
 * Hook for native pull-to-refresh functionality
 * Provides smooth pull-to-refresh experience on mobile devices
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        pullDistance.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Only trigger if scrolling down from the top
      if (diff > 0 && window.scrollY === 0 && !refreshing) {
        pullDistance.current = diff;
        if (diff > 50) {
          setPulling(true);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pulling && pullDistance.current > 80 && !refreshing) {
        setRefreshing(true);
        setPulling(false);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull to refresh error:', error);
        } finally {
          setRefreshing(false);
          pullDistance.current = 0;
        }
      } else {
        setPulling(false);
        pullDistance.current = 0;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, refreshing, onRefresh]);

  return { pulling, refreshing };
}
