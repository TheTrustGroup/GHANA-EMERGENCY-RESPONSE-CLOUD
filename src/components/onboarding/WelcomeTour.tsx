'use client';

/**
 * Welcome Tour Component
 * Interactive guided tour for first-time users
 */

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prefersReducedMotion } from '@/lib/accessibility/keyboard';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform
}

interface WelcomeTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
}

export function WelcomeTour({
  steps,
  onComplete,
  onSkip,
  storageKey = 'welcome-tour-completed',
}: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    // Check if tour has been completed
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(storageKey);
      if (!completed) {
        setIsVisible(true);
      }
    }
  }, [storageKey]);

  const handleNext = () => {
    const step = steps[currentStep];
    if (step.action) {
      step.action();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    setIsVisible(false);
    onSkip?.();
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={handleSkip}
            aria-hidden="true"
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={reducedMotion ? {} : { duration: 0.2 }}
            className="fixed z-[9999] left-4 right-4 top-1/2 -translate-y-1/2 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-labelledby="tour-title"
            aria-describedby="tour-description"
            aria-modal="true"
          >
            <Card className="shadow-2xl border-2">
              <CardHeader className="relative pb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-10"
                  onClick={handleSkip}
                  aria-label="Skip tour"
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle id="tour-title" className="pr-8 text-base sm:text-lg">
                  {step.title}
                </CardTitle>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>
                      Step {currentStep + 1} of {steps.length}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={reducedMotion ? {} : { duration: 0.3 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4 sm:pb-6">
                <p id="tour-description" className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  {step.description}
                </p>
                <div className="flex items-center justify-between gap-2 flex-col sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex-1 w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button onClick={handleNext} className="flex-1 w-full sm:w-auto order-1 sm:order-2">
                    {currentStep === steps.length - 1 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Complete
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
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
