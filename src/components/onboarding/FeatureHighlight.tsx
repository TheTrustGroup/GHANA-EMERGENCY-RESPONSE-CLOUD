'use client';

/**
 * Feature Highlight Component
 * Highlights a specific feature with a tooltip or spotlight
 */

import { useState, useEffect, useRef } from 'react';
import { X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/accessibility/keyboard';

interface FeatureHighlightProps {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onDismiss?: () => void;
  storageKey?: string;
  showOnce?: boolean;
}

export function FeatureHighlight({
  target,
  title,
  description,
  position = 'bottom',
  onDismiss,
  storageKey,
  showOnce = true,
}: FeatureHighlightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});
  const highlightRef = useRef<HTMLDivElement>(null);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    // Check if already shown
    if (showOnce && storageKey && typeof window !== 'undefined') {
      const shown = localStorage.getItem(storageKey);
      if (shown) {
        return;
      }
    }

    // Find target element
    const element = document.querySelector(target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      setIsVisible(true);

      // Calculate position
      const rect = element.getBoundingClientRect();
      const highlightRect = highlightRef.current?.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - (highlightRect?.height || 0) - 12;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 12;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - (highlightRect?.width || 0) - 12;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 12;
          break;
      }

      setPositionStyle({
        top: `${top}px`,
        left: `${left}px`,
        transform: position === 'top' || position === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
      });

      // Highlight target element
      element.style.outline = '2px solid hsl(var(--primary))';
      element.style.outlineOffset = '4px';
      element.style.transition = 'outline 0.2s';

      return () => {
        element.style.outline = '';
        element.style.outlineOffset = '';
      };
    }
    return undefined;
  }, [target, position, storageKey, showOnce]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (showOnce && storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    if (targetElement) {
      targetElement.style.outline = '';
      targetElement.style.outlineOffset = '';
    }
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
            onClick={handleDismiss}
            aria-hidden="true"
          />

          {/* Highlight Card */}
          <motion.div
            ref={highlightRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={reducedMotion ? {} : { duration: 0.2 }}
            className={cn(
              'fixed z-[9999] w-80',
              position === 'top' || position === 'bottom' ? 'left-1/2 -translate-x-1/2' : ''
            )}
            style={positionStyle}
            role="dialog"
            aria-labelledby="highlight-title"
            aria-describedby="highlight-description"
            aria-modal="true"
          >
            <Card className="shadow-2xl border-2 border-primary">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                    <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 id="highlight-title" className="font-semibold text-sm mb-1">
                      {title}
                    </h3>
                    <p id="highlight-description" className="text-xs text-muted-foreground mb-3">
                      {description}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDismiss}
                      className="w-full"
                    >
                      Got it
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={handleDismiss}
                    aria-label="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
