'use client';

import { TrafficZone } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrafficZonesPanelProps {
  zones: TrafficZone[];
}

const severityConfig = {
  LOW: {
    label: 'Low',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  MODERATE: {
    label: 'Moderate',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
  },
  HIGH: {
    label: 'High',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  SEVERE: {
    label: 'Severe',
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-300',
    badge: 'bg-red-200 text-red-800',
  },
};

export function TrafficZonesPanel({ zones }: TrafficZonesPanelProps) {
  const activeZones = zones.filter(z => z.isActive);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Traffic Zones
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto">
          {activeZones.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">No active congestion zones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeZones.map((zone) => {
                const config = severityConfig[zone.severity];
                return (
                  <div
                    key={zone.id}
                    className={cn(
                      "p-3 transition-colors hover:bg-gray-50",
                      config.bg
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={cn("w-4 h-4", config.color)} />
                        <span className="font-medium text-sm text-gray-900">
                          {zone.name}
                        </span>
                      </div>
                      <Badge className={cn("text-[10px]", config.badge)}>
                        {config.label}
                      </Badge>
                    </div>

                    {zone.description && (
                      <p className="text-xs text-gray-500 mb-2">
                        {zone.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        +{zone.calculatedDelay} min delay
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {zone.reportCount} reports
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
