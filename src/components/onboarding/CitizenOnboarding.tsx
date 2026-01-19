'use client';

/**
 * Citizen Onboarding Component
 * Welcome tour for citizen users
 */

import { WelcomeTour, type TourStep } from './WelcomeTour';
// import { useRouter } from 'next/navigation'; // Reserved for future use
import { useSession } from 'next-auth/react';

export function CitizenOnboarding() {
  // const router = useRouter(); // Reserved for future use
  const { data: session } = useSession();

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Ghana Emergency Response',
      description:
        'This platform helps you report emergencies quickly and track their status. Let\'s take a quick tour of the key features.',
      position: 'center',
    },
    {
      id: 'report-emergency',
      title: 'Report Emergency',
      description:
        'Use the large red button to quickly report any emergency. You can add photos, location, and details to help responders.',
      target: '[data-tour="report-emergency"]',
      position: 'bottom',
      action: () => {
        // Scroll to report button if it exists
        const element = document.querySelector('[data-tour="report-emergency"]');
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    },
    {
      id: 'quick-contacts',
      title: 'Quick Emergency Contacts',
      description:
        'Quick dial buttons for Police (191), Fire (192), Ambulance (193), and NADMO (0800). Tap to call directly.',
      target: '[data-tour="quick-contacts"]',
      position: 'bottom',
    },
    {
      id: 'my-reports',
      title: 'My Reports',
      description:
        'View all your reported incidents here. Track their status, see updates from responders, and view resolution details.',
      target: '[data-tour="my-reports"]',
      position: 'bottom',
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description:
        'You now know how to use the platform. Remember: In a real emergency, call the emergency services directly using the quick dial buttons.',
      position: 'center',
    },
  ];

  const handleComplete = () => {
    // Mark onboarding as complete
    if (typeof window !== 'undefined') {
      localStorage.setItem('citizen-onboarding-completed', 'true');
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('citizen-onboarding-completed', 'true');
    }
  };

  // Only show for citizen users on first visit
  if (session?.user?.role !== 'CITIZEN') {
    return null;
  }

  return (
    <WelcomeTour
      steps={steps}
      onComplete={handleComplete}
      onSkip={handleSkip}
      storageKey="citizen-onboarding-completed"
    />
  );
}
