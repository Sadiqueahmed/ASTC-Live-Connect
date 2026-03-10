'use client';

import { TrafficZone } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, MapPin, Clock, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrafficZonesPanelProps {
  zones: TrafficZone[];
}

const severityConfig = {
  SEVERE: { 
    bg: 'bg-red-500', 
    text: 'text-red-700', 
    bgLight: 'bg-red-50',
    border: 'border-red-200',
    label: 'Severe',
    delay: '35+ min'
  },
  HIGH: { 
    bg: 'bg-orange-500', 
    text: 'text-orange-700', 
    bgLight: 'bg-orange-50',
    border: 'border-orange-200',
    label: 'High',
    delay: '20 min'
  },
  MODERATE: { 
    bg: 'bg-amber-500', 
    text: 'text-amber-700', 
    bgLight: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Moderate',
    delay: '10 min'
  },
  LOW: { 
    bg: 'bg-yellow-500', 
    text: 'text-yellow-700', 
    bgLight: 'bg-yellow-50',
    border: 'border-yellow-200',
    label: 'Low',
    delay: '5 min'
  },
};

export function TrafficZonesPanel({ zones }: TrafficZonesPanelProps) {
  if (zones.length === 0) {
    return null;
  }

  const severeCount = zones.filter(z => z.severity === 'SEVERE' || z.severity === 'HIGH').length;

  return (
    <Card className="h-full border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
      <CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-orange-500 to-red-500">
        <CardTitle className="text-sm flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span>Traffic Hotspots</span>
          </div>
          {severeCount > 0 && (
            <Badge className="bg-white/20 text-white border-0 text-[10px] animate-pulse">
              {severeCount} Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 overflow-hidden">
        <ScrollArea className="h-full max-h-[140px]">
          <div className="divide-y divide-slate-100">
            {zones.slice(0, 5).map((zone, index) => {
              const config = severityConfig[zone.severity as keyof typeof severityConfig];
              
              return (
                <div
                  key={zone.id}
                  className="p-3 hover:bg-slate-50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    {/* Severity indicator */}
                    <div className="relative flex-shrink-0">
                      <div className={cn("w-3 h-3 rounded-full", config.bg)} />
                      <div className={cn("absolute inset-0 w-3 h-3 rounded-full animate-ping", config.bg, "opacity-50")} />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 text-sm truncate">
                          {zone.name}
                        </span>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4",
                            config.bgLight,
                            config.text,
                            config.border
                          )}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          +{zone.calculatedDelay || config.delay.replace(' min', '')} min
                        </span>
                        {zone.reportCount > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-600">
                            <Activity className="w-2.5 h-2.5" />
                            {zone.reportCount} reports
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
