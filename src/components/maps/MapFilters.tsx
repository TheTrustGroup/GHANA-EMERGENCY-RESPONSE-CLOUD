'use client';

/**
 * MapFilters Component
 * Filter controls for the live map
 */

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface MapFiltersProps {
  severities: IncidentSeverity[];
  categories: string[];
  statuses: IncidentStatus[];
  timeRange: string;
  showAgencies: boolean;
  showResponders: boolean;
  showClusters: boolean;
  region: string;
  onSeveritiesChange: (severities: IncidentSeverity[]) => void;
  onCategoriesChange: (categories: string[]) => void;
  onStatusesChange: (statuses: IncidentStatus[]) => void;
  onTimeRangeChange: (range: string) => void;
  onShowAgenciesChange: (show: boolean) => void;
  onShowRespondersChange: (show: boolean) => void;
  onShowClustersChange: (show: boolean) => void;
  onRegionChange: (region: string) => void;
  onReset: () => void;
  isMobile?: boolean;
}

const ghanaRegions = [
  'All Regions',
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Brong Ahafo',
  'Western North',
  'Ahafo',
  'Bono',
  'Bono East',
  'Oti',
  'North East',
  'Savannah',
];

const timeRanges = [
  { value: '1h', label: 'Last Hour' },
  { value: 'today', label: 'Today' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: 'custom', label: 'Custom Range' },
];

export function MapFilters({
  severities,
  categories,
  statuses,
  timeRange,
  showAgencies,
  showResponders,
  showClusters,
  region,
  onSeveritiesChange,
  onCategoriesChange,
  onStatusesChange,
  onTimeRangeChange,
  onShowAgenciesChange,
  onShowRespondersChange,
  onShowClustersChange,
  onRegionChange,
  onReset,
  isMobile = false,
}: MapFiltersProps) {
  const [open, setOpen] = useState(false);

  const handleSeverityToggle = (severity: IncidentSeverity) => {
    if (severities.includes(severity)) {
      onSeveritiesChange(severities.filter((s) => s !== severity));
    } else {
      onSeveritiesChange([...severities, severity]);
    }
  };

  const handleCategoryToggle = (category: string) => {
    if (categories.includes(category)) {
      onCategoriesChange(categories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...categories, category]);
    }
  };

  const handleStatusToggle = (status: IncidentStatus) => {
    if (statuses.includes(status)) {
      onStatusesChange(statuses.filter((s) => s !== status));
    } else {
      onStatusesChange([...statuses, status]);
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Separator />

      {/* Severity Filter */}
      <div>
        <Label className="mb-2 block">Severity</Label>
        <div className="space-y-2">
          {Object.values(IncidentSeverity).map((severity) => (
            <div key={severity} className="flex items-center space-x-2">
              <Checkbox
                id={`severity-${severity}`}
                checked={severities.includes(severity)}
                onCheckedChange={() => handleSeverityToggle(severity)}
              />
              <Label htmlFor={`severity-${severity}`} className="cursor-pointer text-sm">
                {severity}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Category Filter */}
      <div>
        <Label className="mb-2 block">Category</Label>
        <div className="space-y-2">
          {['fire', 'medical', 'accident', 'natural_disaster', 'crime', 'infrastructure', 'other'].map(
            (category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label htmlFor={`category-${category}`} className="cursor-pointer text-sm capitalize">
                  {category.replace('_', ' ')}
                </Label>
              </div>
            )
          )}
        </div>
      </div>

      <Separator />

      {/* Status Filter */}
      <div>
        <Label className="mb-2 block">Status</Label>
        <div className="space-y-2">
          {[IncidentStatus.REPORTED, IncidentStatus.DISPATCHED, IncidentStatus.IN_PROGRESS].map(
            (status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={statuses.includes(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                />
                <Label htmlFor={`status-${status}`} className="cursor-pointer text-sm">
                  {status.replace('_', ' ')}
                </Label>
              </div>
            )
          )}
        </div>
      </div>

      <Separator />

      {/* Time Range */}
      <div>
        <Label className="mb-2 block">Time Range</Label>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Region Filter */}
      <div>
        <Label className="mb-2 block">Region</Label>
        <Select value={region} onValueChange={onRegionChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ghanaRegions.map((reg) => (
              <SelectItem key={reg} value={reg}>
                {reg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Show/Hide Options */}
      <div>
        <Label className="mb-2 block">Display Options</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-agencies"
              checked={showAgencies}
              onCheckedChange={onShowAgenciesChange}
            />
            <Label htmlFor="show-agencies" className="cursor-pointer text-sm">
              Show Agencies
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-responders"
              checked={showResponders}
              onCheckedChange={onShowRespondersChange}
            />
            <Label htmlFor="show-responders" className="cursor-pointer text-sm">
              Show Responders
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-clusters"
              checked={showClusters}
              onCheckedChange={onShowClustersChange}
            />
            <Label htmlFor="show-clusters" className="cursor-pointer text-sm">
              Enable Clustering
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Map Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className="h-full overflow-y-auto p-4">
      {content}
    </Card>
  );
}

