'use client';

/**
 * Satellite Incident Map Component
 * Dark-themed satellite map for command center
 */

import { LiveIncidentMap } from './LiveIncidentMap';

interface SatelliteIncidentMapProps {
  incidents: any[];
  selectedIncidentId?: string | null;
  onIncidentClick?: (id: string) => void;
  height?: string;
}

export default function SatelliteIncidentMap({
  incidents,
  selectedIncidentId,
  onIncidentClick,
  height = 'h-full',
}: SatelliteIncidentMapProps) {
  return (
    <div className={height}>
      <LiveIncidentMap
        incidents={incidents}
        selectedIncidentId={selectedIncidentId || undefined}
        onIncidentClick={(incident) => onIncidentClick?.(incident.id)}
        mapStyle="satellite-streets"
        className="w-full h-full"
      />
    </div>
  );
}
