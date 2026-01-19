'use client';

/**
 * Search Bar Component
 * Global search functionality for incidents, users, agencies
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { trpc } from '@/lib/trpc/client';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  type: 'incident' | 'user' | 'agency';
  title: string;
  subtitle?: string;
  href: string;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  variant?: 'default' | 'compact';
}

export function SearchBar({ className, placeholder = 'Search...', variant = 'default' }: SearchBarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search queries
  const { data: incidents, isLoading: incidentsLoading } = trpc.incidents.search.useQuery(
    { query: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length >= 2 }
  );

  const { data: users, isLoading: usersLoading } = trpc.users.search.useQuery(
    { query: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length >= 2 }
  );

  const { data: agencies, isLoading: agenciesLoading } = trpc.agencies.search.useQuery(
    { query: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length >= 2 }
  );

  const isLoading = incidentsLoading || usersLoading || agenciesLoading;
  const hasQuery = debouncedQuery.length >= 2;

  // Build search results
  const results: SearchResult[] = [];
  
  if (incidents) {
    incidents.forEach((incident) => {
      results.push({
        id: incident.id,
        type: 'incident',
        title: incident.title,
        subtitle: incident.status,
        href: `/dashboard/incidents/${incident.id}`,
      });
    });
  }

  if (users) {
    users.forEach((user) => {
      results.push({
        id: user.id,
        type: 'user',
        title: user.name || user.email || 'Unknown User',
        subtitle: user.role,
        href: `/dashboard/users/${user.id}`,
      });
    });
  }

  if (agencies) {
    agencies.forEach((agency) => {
      results.push({
        id: agency.id,
        type: 'agency',
        title: agency.name,
        subtitle: agency.type,
        href: `/dashboard/agencies/${agency.id}`,
      });
    });
  }

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    router.push(result.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  if (variant === 'compact') {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('w-full justify-start text-muted-foreground', className)}
            aria-label="Open search"
          >
            <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
              onKeyDown={handleKeyDown}
              ref={inputRef}
            />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading && !hasQuery && (
                <CommandEmpty>
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Start typing to search incidents, users, and agencies
                    </p>
                  </div>
                </CommandEmpty>
              )}
              {!isLoading && hasQuery && results.length === 0 && (
                <CommandEmpty>
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try a different search term
                    </p>
                  </div>
                </CommandEmpty>
              )}
              {results.length > 0 && (
                <>
                  {incidents && incidents.length > 0 && (
                    <CommandGroup heading="Incidents">
                      {incidents.map((incident, index) => (
                        <CommandItem
                          key={incident.id}
                          value={incident.id}
                          onSelect={() =>
                            handleSelect({
                              id: incident.id,
                              type: 'incident',
                              title: incident.title,
                              subtitle: incident.status,
                              href: `/dashboard/incidents/${incident.id}`,
                            })
                          }
                          className={cn(
                            'cursor-pointer',
                            selectedIndex === index && 'bg-accent'
                          )}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{incident.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {incident.status}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {users && users.length > 0 && (
                    <CommandGroup heading="Users">
                      {users.map((user, index) => (
                        <CommandItem
                          key={user.id}
                          value={user.id}
                          onSelect={() =>
                            handleSelect({
                              id: user.id,
                              type: 'user',
                              title: user.name || user.email || 'Unknown User',
                              subtitle: user.role,
                              href: `/dashboard/users/${user.id}`,
                            })
                          }
                          className={cn(
                            'cursor-pointer',
                            selectedIndex === index + (incidents?.length || 0) && 'bg-accent'
                          )}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {user.name || user.email || 'Unknown User'}
                            </span>
                            <span className="text-xs text-muted-foreground">{user.role}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {agencies && agencies.length > 0 && (
                    <CommandGroup heading="Agencies">
                      {agencies.map((agency, index) => (
                        <CommandItem
                          key={agency.id}
                          value={agency.id}
                          onSelect={() =>
                            handleSelect({
                              id: agency.id,
                              type: 'agency',
                              title: agency.name,
                              subtitle: agency.type,
                              href: `/dashboard/agencies/${agency.id}`,
                            })
                          }
                          className={cn(
                            'cursor-pointer',
                            selectedIndex ===
                              index +
                                (incidents?.length || 0) +
                                (users?.length || 0) && 'bg-accent'
                          )}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{agency.name}</span>
                            <span className="text-xs text-muted-foreground">{agency.type}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Default variant - always visible search bar
  return (
    <div className={cn('relative w-full max-w-md', className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          className="pl-10 pr-10"
          aria-label="Search incidents, users, and agencies"
          aria-expanded={open}
          aria-controls="search-results"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {open && hasQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full z-50 mt-2 w-full rounded-md border bg-popover shadow-lg"
            id="search-results"
            role="listbox"
            aria-label="Search results"
          >
            <div className="max-h-[400px] overflow-y-auto p-2">
              {isLoading && (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No results found</p>
                </div>
              )}
              {results.length > 0 && (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleSelect(result)}
                      className={cn(
                        'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                        'hover:bg-accent focus:bg-accent focus:outline-none',
                        selectedIndex === index && 'bg-accent'
                      )}
                      role="option"
                      aria-selected={selectedIndex === index}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{result.title}</span>
                        {result.subtitle && (
                          <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
