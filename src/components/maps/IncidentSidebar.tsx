'use client';

/**
 * IncidentSidebar Component
 * List of active incidents with filtering and sorting
 */

import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import { getCategoryIcon, calculateDistance } from '@/lib/map-utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  district: string;
  region: string;
}

interface IncidentSidebarProps {
  incidents: Incident[];
  selectedIncidentId?: string;
  onIncidentClick: (incident: Incident) => void;
  statusFilter?: IncidentStatus | 'all';
  sortBy: 'severity' | 'time' | 'distance';
  userLocation?: { latitude: number; longitude: number };
  isMobile?: boolean;
}

const statusColors: Record<IncidentStatus, string> = {
  REPORTED: 'bg-gray-100 text-gray-800',
  DISPATCHED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-800',
};

const severityColors: Record<IncidentSeverity, string> = {
  LOW: 'bg-severity-low text-white',
  MEDIUM: 'bg-severity-medium text-white',
  HIGH: 'bg-severity-high text-white',
  CRITICAL: 'bg-severity-critical text-white',
};

export function IncidentSidebar({
  incidents,
  selectedIncidentId,
  onIncidentClick,
  sortBy,
  userLocation,
  isMobile = false,
}: IncidentSidebarProps) {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Scroll to selected incident
  useEffect(() => {
    if (selectedIncidentId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedIncidentId]);

  // Sort incidents
  const sortedIncidents = [...incidents].sort((a, b) => {
    switch (sortBy) {
      case 'severity':
        const severityOrder: Record<IncidentSeverity, number> = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case 'time':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'distance':
        if (!userLocation) return 0;
        const distA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );
        const distB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      default:
        return 0;
    }
  });

  const content = (
    <div className="flex h-full flex-col">
      <div className="mb-4 space-y-2">
        <h2 className="font-semibold">Active Incidents</h2>
        <p className="text-sm text-muted-foreground">{incidents.length} incidents</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {sortedIncidents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No incidents found
            </div>
          ) : (
            sortedIncidents.map((incident) => {
              const Icon = getCategoryIcon(incident.category as any);
              const isSelected = selectedIncidentId === incident.id;
              const distance = userLocation
                ? calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    incident.latitude,
                    incident.longitude
                  )
                : null;

              return (
                <Card
                  key={incident.id}
                  ref={isSelected ? selectedRef : null}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected && 'ring-2 ring-blue-600'
                  )}
                  onClick={() => onIncidentClick(incident)}
                >
                  <div className="p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium line-clamp-2 flex-1">{incident.title}</h3>
                      </div>
                      <Badge className={cn('text-xs', severityColors[incident.severity])}>
                        {incident.severity}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{incident.district}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}</span>
                      </div>
                      {distance !== null && (
                        <span className="text-xs text-muted-foreground">{distance.toFixed(1)} km</span>
                      )}
                    </div>

                    <div className="mt-2">
                      <Badge className={cn('text-xs', statusColors[incident.status])}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Active Incidents</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className="h-full overflow-hidden p-4">
      {content}
    </Card>
  );
}

