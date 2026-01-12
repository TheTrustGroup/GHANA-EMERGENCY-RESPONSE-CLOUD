'use client';

/**
 * Live Map Page
 * Full-screen interactive map showing all active incidents and responders
 */

import { useState, useMemo, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { LiveIncidentMap } from '@/components/maps/LiveIncidentMap';
import { IncidentSidebar } from '@/components/maps/IncidentSidebar';
import { MapFilters } from '@/components/maps/MapFilters';
import { Button } from '@/components/ui/button';
import { useResponsive } from '@/hooks/useResponsive';
import { trpc } from '@/lib/trpc/client';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function LiveMapPage() {
  const { isMobile } = useResponsive();
  const { toast } = useToast();

  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  // Filter states
  const [severities, setSeverities] = useState<IncidentSeverity[]>(Object.values(IncidentSeverity));
  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<IncidentStatus[]>([
    IncidentStatus.REPORTED,
    IncidentStatus.DISPATCHED,
    IncidentStatus.IN_PROGRESS,
  ]);
  const [timeRange, setTimeRange] = useState('24h');
  const [showAgencies, setShowAgencies] = useState(false);
  const [showResponders, setShowResponders] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [region, setRegion] = useState('All Regions');
  const [sortBy] = useState<'severity' | 'time' | 'distance'>('severity');

  // Selected incident
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>();

  // Fetch active incidents
  const { data: incidentsData } = trpc.incidents.getActive.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch agencies
  const { data: agencies } = trpc.agencies.getAll.useQuery(undefined, {
    enabled: showAgencies,
  });

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    if (!incidentsData) return [];

    return incidentsData.filter((incident) => {
      // Severity filter
      if (severities.length > 0 && !severities.includes(incident.severity)) {
        return false;
      }

      // Category filter
      if (categories.length > 0 && !categories.includes(incident.category)) {
        return false;
      }

      // Status filter
      if (statuses.length > 0 && !statuses.includes(incident.status)) {
        return false;
      }

      // Region filter
      if (region !== 'All Regions' && incident.region !== region) {
        return false;
      }

      // Time range filter
      const now = new Date();
      const incidentDate = new Date(incident.createdAt);
      const hoursAgo = (now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60);

      switch (timeRange) {
        case '1h':
          if (hoursAgo > 1) return false;
          break;
        case 'today':
          if (incidentDate.toDateString() !== now.toDateString()) return false;
          break;
        case '24h':
          if (hoursAgo > 24) return false;
          break;
        case '7d':
          if (hoursAgo > 168) return false;
          break;
      }

      return true;
    });
  }, [incidentsData, severities, categories, statuses, region, timeRange]);

  // Handle incident click
  const handleIncidentClick = useCallback((incident: any) => {
    setSelectedIncidentId(incident.id);
    if (isMobile) {
      setLeftSidebarOpen(false);
    }

    // Show toast for critical incidents
    if (incident.severity === IncidentSeverity.CRITICAL) {
      toast({
        title: 'Critical Incident',
        description: incident.title,
        variant: 'destructive',
      });
    }
  }, [isMobile, toast]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSeverities(Object.values(IncidentSeverity));
    setCategories([]);
    setStatuses([IncidentStatus.REPORTED, IncidentStatus.DISPATCHED, IncidentStatus.IN_PROGRESS]);
    setTimeRange('24h');
    setRegion('All Regions');
  }, []);

  return (
    <RootLayout>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-white p-2 shadow-sm">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-lg font-semibold">Live Incident Map</h1>
            <span className="text-sm text-muted-foreground">
              {filteredIncidents.length} active incidents
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <>
                <Button
                  variant={leftSidebarOpen ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                >
                  Incidents
                </Button>
                <Button
                  variant={rightSidebarOpen ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                >
                  Filters
                </Button>
              </>
            )}
            {isMobile && (
              <MapFilters
                severities={severities}
                categories={categories}
                statuses={statuses}
                timeRange={timeRange}
                showAgencies={showAgencies}
                showResponders={showResponders}
                showClusters={showClusters}
                region={region}
                onSeveritiesChange={setSeverities}
                onCategoriesChange={setCategories}
                onStatusesChange={setStatuses}
                onTimeRangeChange={setTimeRange}
                onShowAgenciesChange={setShowAgencies}
                onShowRespondersChange={setShowResponders}
                onShowClustersChange={setShowClusters}
                onRegionChange={setRegion}
                onReset={handleResetFilters}
                isMobile={true}
              />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Left Sidebar - Incidents */}
          {!isMobile && leftSidebarOpen && (
            <div className="w-80 border-r bg-white">
              <IncidentSidebar
                incidents={filteredIncidents.map((inc) => ({
                  id: inc.id,
                  title: inc.title,
                  severity: inc.severity,
                  status: inc.status,
                  category: inc.category,
                  latitude: inc.latitude,
                  longitude: inc.longitude,
                  createdAt: inc.createdAt,
                  district: inc.district,
                  region: inc.region,
                }))}
                selectedIncidentId={selectedIncidentId}
                onIncidentClick={handleIncidentClick}
                statusFilter="all"
                sortBy={sortBy}
              />
            </div>
          )}

          {isMobile && (
            <Sheet open={leftSidebarOpen} onOpenChange={setLeftSidebarOpen}>
              <SheetContent side="left" className="w-80">
                <IncidentSidebar
                  incidents={filteredIncidents.map((inc) => ({
                    id: inc.id,
                    title: inc.title,
                    severity: inc.severity,
                    status: inc.status,
                    category: inc.category,
                    latitude: inc.latitude,
                    longitude: inc.longitude,
                    createdAt: inc.createdAt,
                    district: inc.district,
                    region: inc.region,
                  }))}
                  selectedIncidentId={selectedIncidentId}
                  onIncidentClick={handleIncidentClick}
                  statusFilter="all"
                  sortBy={sortBy}
                />
              </SheetContent>
            </Sheet>
          )}

          {/* Map */}
          <div className="relative flex-1">
            <LiveIncidentMap
              incidents={filteredIncidents.map((inc) => ({
                id: inc.id,
                title: inc.title,
                severity: inc.severity,
                status: inc.status,
                category: inc.category,
                latitude: inc.latitude,
                longitude: inc.longitude,
                createdAt: inc.createdAt,
                district: inc.district,
                region: inc.region,
              }))}
              agencies={showAgencies ? (agencies || []) : []}
              selectedIncidentId={selectedIncidentId}
              showAgencies={showAgencies}
              showResponders={showResponders}
              onIncidentClick={handleIncidentClick}
              className="h-full w-full"
            />
          </div>

          {/* Right Sidebar - Filters */}
          {!isMobile && rightSidebarOpen && (
            <div className="w-80 border-l bg-white">
              <MapFilters
                severities={severities}
                categories={categories}
                statuses={statuses}
                timeRange={timeRange}
                showAgencies={showAgencies}
                showResponders={showResponders}
                showClusters={showClusters}
                region={region}
                onSeveritiesChange={setSeverities}
                onCategoriesChange={setCategories}
                onStatusesChange={setStatuses}
                onTimeRangeChange={setTimeRange}
                onShowAgenciesChange={setShowAgencies}
                onShowRespondersChange={setShowResponders}
                onShowClustersChange={setShowClusters}
                onRegionChange={setRegion}
                onReset={handleResetFilters}
              />
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
}

