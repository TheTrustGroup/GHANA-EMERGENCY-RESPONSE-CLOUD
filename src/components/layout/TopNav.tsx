'use client';

/**
 * TopNav Component
 * Top navigation bar with breadcrumbs, search, notifications, and user menu
 */

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Menu, User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { cn } from '@/lib/utils';

interface TopNavProps {
  onMenuClick?: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userName = session?.user?.name || session?.user?.email || 'User';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return [];

    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const label = path
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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
            <nav className="hidden items-center space-x-2 text-sm md:flex" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.href} className="flex items-center">
                  {idx > 0 && <ChevronRight className="mx-2 h-4 w-4 text-slate-400" />}
                  <Link
                    href={crumb.href}
                    className={cn(
                      'transition-colors hover:text-foreground',
                      idx === breadcrumbs.length - 1
                        ? 'font-semibold text-foreground'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {crumb.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Center: Premium Search Bar */}
          <div className="hidden flex-1 max-w-lg md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search incidents, agencies, responders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-blue-500 premium-shadow-sm transition-all"
              />
            </form>
          </div>

          {/* Right: Notifications + User Menu */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search */}
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/dashboard/search')}
                className="rounded-xl hover:bg-white/10"
              >
                <Search className="h-5 w-5" />
              </Button>
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

