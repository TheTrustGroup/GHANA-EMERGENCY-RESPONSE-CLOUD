'use client';

/**
 * RootLayout Component
 * Main application shell with Sidebar, TopNav, and Main Content Area
 * Responsive design with mobile menu support
 */

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useResponsive } from '@/hooks/useResponsive';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const { status } = useSession();
  const pathname = usePathname();
  const { isMobile } = useResponsive();

  // Don't show layout on auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  const isPublicPage = pathname === '/' || isAuthPage;

  // Show loading state while checking session
  if (status === 'loading' && !isPublicPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Public pages (home, auth) - no layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Protected pages - show full layout
  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Subtle Background Pattern */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/images/backgrounds/dashboard-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03, // Very subtle
        }}
      />
      
      {/* Optional: Gradient overlay for better contrast */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/30" />
      
      {/* Main Layout */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar - Desktop only */}
        {!isMobile && <Sidebar />}

        {/* Main Content Area - Add left margin to account for fixed sidebar */}
        <div className={cn(
          "flex flex-1 flex-col overflow-hidden",
          !isMobile && "ml-64" // Add left margin equal to sidebar width (w-64 = 256px)
        )}>
          {/* Top Navigation */}
          <TopNav />

          {/* Page Content - Premium Background */}
          <main className="flex-1 overflow-y-auto bg-background/50 dark:bg-background/80 backdrop-blur-sm">
            <div className="min-h-full p-6 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

