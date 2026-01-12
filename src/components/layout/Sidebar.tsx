'use client';

/**
 * Sidebar Component
 * Fixed sidebar with role-based navigation menu
 * Collapsible on mobile using Sheet component
 */

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@prisma/client';
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  Users,
  BarChart3,
  FileText,
  Settings,
  Radio,
  ClipboardList,
  Phone,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useResponsive } from '@/hooks/useResponsive';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.AGENCY_ADMIN,
      UserRole.DISPATCHER,
      UserRole.RESPONDER,
      UserRole.CITIZEN,
    ],
  },
  // SYSTEM_ADMIN items
  {
    label: 'Incidents',
    href: '/dashboard/incidents',
    icon: AlertTriangle,
    roles: [UserRole.SYSTEM_ADMIN],
  },
  {
    label: 'Agencies',
    href: '/dashboard/agencies',
    icon: Building2,
    roles: [UserRole.SYSTEM_ADMIN],
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: [UserRole.SYSTEM_ADMIN],
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: [UserRole.SYSTEM_ADMIN, UserRole.AGENCY_ADMIN],
  },
  {
    label: 'Audit Logs',
    href: '/dashboard/audit',
    icon: FileText,
    roles: [UserRole.SYSTEM_ADMIN],
  },
  // AGENCY_ADMIN items
  {
    label: 'My Agency Incidents',
    href: '/dashboard/agency/incidents',
    icon: AlertTriangle,
    roles: [UserRole.AGENCY_ADMIN],
  },
  {
    label: 'My Team',
    href: '/dashboard/agency/team',
    icon: Users,
    roles: [UserRole.AGENCY_ADMIN],
  },
  // DISPATCHER items
  {
    label: 'Active Incidents',
    href: '/dashboard/dispatch/active',
    icon: AlertTriangle,
    roles: [UserRole.DISPATCHER],
  },
  {
    label: 'Dispatch Queue',
    href: '/dashboard/dispatch/queue',
    icon: Radio,
    roles: [UserRole.DISPATCHER],
  },
  {
    label: 'My Dispatches',
    href: '/dashboard/dispatch/my-dispatches',
    icon: ClipboardList,
    roles: [UserRole.DISPATCHER],
  },
  // RESPONDER items
  {
    label: 'My Assignments',
    href: '/dashboard/responder/assignments',
    icon: ClipboardList,
    roles: [UserRole.RESPONDER],
  },
  {
    label: 'Available Incidents',
    href: '/dashboard/responder/available',
    icon: AlertTriangle,
    roles: [UserRole.RESPONDER],
  },
  // CITIZEN items
  {
    label: 'My Reports',
    href: '/dashboard/citizen/reports',
    icon: FileText,
    roles: [UserRole.CITIZEN],
  },
  {
    label: 'Report Incident',
    href: '/dashboard/citizen/report',
    icon: AlertTriangle,
    roles: [UserRole.CITIZEN],
  },
  {
    label: 'Emergency Contacts',
    href: '/dashboard/citizen/contacts',
    icon: Phone,
    roles: [UserRole.CITIZEN],
  },
  // Common items
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.AGENCY_ADMIN,
      UserRole.DISPATCHER,
      UserRole.RESPONDER,
      UserRole.CITIZEN,
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { isMobile } = useResponsive();

  const userRole = session?.user?.role;
  const userName = session?.user?.name || session?.user?.email || 'User';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Filter nav items based on user role
  // If role is not available yet, show all items temporarily
  let filteredNavItems: NavItem[] = [];
  
  if (status === 'loading') {
    // Show loading state - will be handled in render
    filteredNavItems = [];
  } else if (userRole) {
    filteredNavItems = navItems.filter((item) => item.roles.includes(userRole as UserRole));
  } else {
    // Fallback: if no role detected, show common items (Dashboard + Settings)
    filteredNavItems = navItems.filter((item) => 
      item.roles.includes(UserRole.SYSTEM_ADMIN) || 
      item.roles.includes(UserRole.CITIZEN)
    );
  }
  
  // Debug logging (remove in production)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[Sidebar Debug]', {
      status,
      userRole,
      filteredCount: filteredNavItems.length,
      allItemsCount: navItems.length,
    });
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col premium-gradient text-white premium-shadow-lg">
      {/* Logo Section - Premium Header */}
      <div className="flex h-20 items-center border-b border-white/10 px-6 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 premium-shadow transition-transform group-hover:scale-105">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">Emergency</span>
            <span className="text-xs font-medium text-slate-300">Response Platform</span>
          </div>
        </Link>
      </div>

      {/* Navigation - Premium Styling */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {status === 'loading' ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredNavItems.length > 0 ? (
          filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  'group flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white premium-shadow'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 transition-transform flex-shrink-0',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                )} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })
        ) : (
          // Fallback: Always show at least Dashboard and Settings
          <>
            <Link
              href="/dashboard"
              className={cn(
                'group flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                pathname === '/dashboard' || pathname?.startsWith('/dashboard/')
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white premium-shadow'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className={cn(
                'group flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                pathname === '/dashboard/settings'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white premium-shadow'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Settings</span>
            </Link>
            {userRole && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-500 px-4">
                  Role: {userRole.replace('_', ' ')}
                </p>
              </div>
            )}
          </>
        )}
      </nav>

      {/* User Profile - Premium Footer */}
      <div className="border-t border-white/10 p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-3 rounded-xl bg-white/5 px-3 py-3 backdrop-blur-sm">
          <Avatar className="h-10 w-10 ring-2 ring-white/20">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="truncate text-xs font-medium text-slate-400 capitalize">
              {userRole?.replace('_', ' ').toLowerCase()}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="mt-3 w-full justify-start rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-medium">Sign out</span>
        </Button>
      </div>
    </div>
  );

  // Mobile: Use Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64">
      <SidebarContent />
    </aside>
  );
}

