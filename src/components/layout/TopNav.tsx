'use client';

/**
 * TopNav Component
 * Top navigation bar with breadcrumbs, search, notifications, and user menu
 */

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
// import { useRouter } from 'next/navigation'; // Reserved for future use
import Link from 'next/link';
import { Menu, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Sidebar } from './Sidebar';
import { useResponsive } from '@/hooks/useResponsive';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SearchBar } from '@/components/navigation/SearchBar';
import { Breadcrumbs } from '@/components/accessibility/Breadcrumbs';

interface TopNavProps {
  onMenuClick?: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { data: session } = useSession();
  // const pathname = usePathname(); // Reserved for future use
  // const router = useRouter(); // Reserved for future use
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userName = session?.user?.name || session?.user?.email || 'User';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="sticky top-0 z-30 flex h-20 items-center border-b border-white/10 glass premium-shadow">
        <div className="flex w-full items-center justify-between px-6 md:px-8">
          {/* Left: Mobile menu + Breadcrumbs */}
          <div className="flex items-center space-x-6">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSidebarOpen(true);
                  onMenuClick?.();
                }}
                className="rounded-xl hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Breadcrumbs - Premium Styling */}
            <div className="hidden md:block">
              <Breadcrumbs className="text-slate-500" />
            </div>
          </div>

          {/* Center: Premium Search Bar */}
          <div className="hidden flex-1 max-w-lg md:block">
            <SearchBar
              placeholder="Search incidents, agencies, users..."
              variant="default"
            />
          </div>

          {/* Right: Notifications + User Menu */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search */}
            {isMobile && (
              <SearchBar
                placeholder="Search..."
                variant="compact"
                className="w-auto"
              />
            )}

            {/* Notifications */}
            <div className="rounded-xl">
              <NotificationBell />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu - Premium Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-xl hover:bg-white/10 transition-all">
                  <Avatar className="h-11 w-11 ring-2 ring-white/20 premium-shadow">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass premium-shadow-lg rounded-xl border-white/20 p-2">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{userName}</p>
                    <p className="text-xs leading-none text-slate-500">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="rounded-lg px-3 py-2 cursor-pointer">
                  <Link href="/dashboard/profile" className="flex items-center">
                    <User className="mr-3 h-4 w-4" />
                    <span className="font-medium">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg px-3 py-2 cursor-pointer">
                  <Link href="/dashboard/settings" className="flex items-center">
                    <Settings className="mr-3 h-4 w-4" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}

