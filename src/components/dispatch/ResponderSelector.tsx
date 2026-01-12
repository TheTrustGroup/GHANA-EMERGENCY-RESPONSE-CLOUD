'use client';

/**
 * ResponderSelector Component
 * Filterable list of responders with multi-select
 */

import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { calculateDistance } from '@/lib/map-utils';
import { cn } from '@/lib/utils';

interface Responder {
  id: string;
  name: string;
  status: 'available' | 'dispatched' | 'off-duty';
  latitude?: number | null;
  longitude?: number | null;
  agencyId: string;
  skills?: string[];
}

interface ResponderSelectorProps {
  responders: Responder[];
  incidentLocation: { latitude: number; longitude: number };
  selectedResponderIds: string[];
  onSelectionChange: (responderIds: string[]) => void;
  multiSelect?: boolean;
}

export function ResponderSelector({
  responders,
  incidentLocation,
  selectedResponderIds,
  onSelectionChange,
  multiSelect = false,
}: ResponderSelectorProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter responders
  const filtered = responders
    .filter((responder) => {
      // Status filter
      if (statusFilter !== 'all' && responder.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery && !responder.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    })
    .map((responder) => {
      let distance: number | null = null;
      if (responder.latitude && responder.longitude) {
        distance = calculateDistance(
          incidentLocation.latitude,
          incidentLocation.longitude,
          responder.latitude,
          responder.longitude
        );
      }
      return { ...responder, distance };
    })
    .filter((responder) => {
      // Distance filter
      if (distanceFilter !== 'all' && responder.distance !== null) {
        const maxDistance = parseInt(distanceFilter);
        if (responder.distance > maxDistance) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by distance if available
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return 0;
    });

  const handleToggle = (responderId: string) => {
    if (multiSelect) {
      if (selectedResponderIds.includes(responderId)) {
        onSelectionChange(selectedResponderIds.filter((id) => id !== responderId));
      } else {
        onSelectionChange([...selectedResponderIds, responderId]);
      }
    } else {
      onSelectionChange([responderId]);
    }
  };

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    dispatched: 'bg-purple-100 text-purple-800',
    'off-duty': 'bg-gray-100 text-gray-800',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Responders</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-4 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search responders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="off-duty">Off Duty</SelectItem>
              </SelectContent>
            </Select>
            <Select value={distanceFilter} onValueChange={setDistanceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Distance</SelectItem>
                <SelectItem value="10">Within 10 km</SelectItem>
                <SelectItem value="25">Within 25 km</SelectItem>
                <SelectItem value="50">Within 50 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Responders List */}
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No responders found</p>
            ) : (
              filtered.map((responder) => {
                const isSelected = selectedResponderIds.includes(responder.id);
                const isAvailable = responder.status === 'available';

                return (
                  <Card
                    key={responder.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected && 'ring-2 ring-blue-600'
                    )}
                    onClick={() => isAvailable && handleToggle(responder.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => isAvailable && handleToggle(responder.id)}
                          disabled={!isAvailable}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{responder.name}</h4>
                            <Badge
                              className={cn('text-xs', statusColors[responder.status])}
                            >
                              {responder.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {responder.distance !== null && (
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{responder.distance.toFixed(1)} km away</span>
                            </div>
                          )}
                          {responder.skills && responder.skills.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {responder.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>

        {selectedResponderIds.length > 0 && (
          <div className="mt-4 rounded-lg border bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-900">
              {selectedResponderIds.length} responder(s) selected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

