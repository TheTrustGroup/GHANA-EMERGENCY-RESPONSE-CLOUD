'use client';

/**
 * AgencyRecommendations Component
 * Smart recommendations for agency selection
 */

import { Star, MapPin, Users, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { calculateRecommendedAgencies } from '@/lib/dispatch-logic';
import { AgencyType, IncidentSeverity } from '@prisma/client';
import { cn } from '@/lib/utils';

interface Agency {
  id: string;
  name: string;
  type: AgencyType;
  latitude: number | null;
  longitude: number | null;
  activeIncidentsCount?: number;
  availableRespondersCount?: number;
  avgResponseTime?: number | null;
}

interface Incident {
  category: string;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
}

interface AgencyRecommendationsProps {
  incident: Incident;
  agencies: Agency[];
  selectedAgencyId?: string;
  onSelectAgency: (agencyId: string) => void;
}

export function AgencyRecommendations({
  incident,
  agencies,
  selectedAgencyId,
  onSelectAgency,
}: AgencyRecommendationsProps) {
  const recommendations = calculateRecommendedAgencies(incident, agencies);

  const getStarRating = (score: number): number => {
    // Convert score (0-100) to stars (1-5)
    if (score >= 80) return 5;
    if (score >= 60) return 4;
    if (score >= 40) return 3;
    if (score >= 20) return 2;
    return 1;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Agencies</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No agencies available</p>
            ) : (
              recommendations.map((agency) => {
                const stars = getStarRating(agency.score);
                const isSelected = selectedAgencyId === agency.id;

                return (
                  <Card
                    key={agency.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected && 'ring-2 ring-blue-600'
                    )}
                    onClick={() => onSelectAgency(agency.id)}
                  >
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{agency.name}</h3>
                          <p className="text-sm text-muted-foreground">{agency.type}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-4 w-4',
                                i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mb-3 space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{agency.distance} km away</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>
                            {agency.availableRespondersCount || 0} responders available
                          </span>
                        </div>
                        {agency.avgResponseTime && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Avg: {agency.avgResponseTime} min</span>
                          </div>
                        )}
                        {agency.activeIncidentsCount !== undefined && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>{agency.activeIncidentsCount} active incidents</span>
                          </div>
                        )}
                      </div>

                      {agency.reasons.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {agency.reasons.slice(0, 2).map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button
                        size="sm"
                        className="w-full"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAgency(agency.id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select Agency'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

