'use client';

import { BusRoute, ETAResult } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Bus, 
  Snowflake, 
  Zap, 
  Users,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface StopETAPanelProps {
  route: BusRoute | null;
  selectedStopId: string | null;
}

export function StopETAPanel({ route, selectedStopId }: StopETAPanelProps) {
  const [etas, setEtas] = useState<ETAResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route && selectedStopId) {
      fetchETAs();
      const interval = setInterval(fetchETAs, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [route, selectedStopId]);

  const fetchETAs = async () => {
    if (!route || !selectedStopId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/eta?routeId=${route.id}&stopId=${selectedStopId}`
      );
      const data = await response.json();
      if (data.success) {
        setEtas(data.data.upcomingBuses);
      }
    } catch (error) {
      console.error('Error fetching ETAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedStop = route?.stops.find(s => s.id === selectedStopId);

  if (!route || !selectedStopId || !selectedStop) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Select a stop to view ETAs</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            {selectedStop.name}
          </div>
          <Badge variant="outline" className="text-xs">
            {route.routeNumber}
          </Badge>
        </CardTitle>
        {selectedStop.landmark && (
          <p className="text-sm text-gray-500 -mt-1">
            Near: {selectedStop.landmark}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : etas.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming buses</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {etas.map((eta, index) => (
              <div
                key={eta.busId}
                className={cn(
                  "p-4 transition-colors hover:bg-gray-50",
                  index === 0 && "bg-emerald-50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        eta.busType === 'AC' && "bg-sky-100",
                        eta.busType === 'ELECTRIC' && "bg-green-100",
                        eta.busType === 'STANDARD' && "bg-amber-100",
                        eta.busType === 'MINI' && "bg-purple-100"
                      )}
                    >
                      {eta.busType === 'AC' ? (
                        <Snowflake className="w-4 h-4 text-sky-600" />
                      ) : eta.busType === 'ELECTRIC' ? (
                        <Zap className="w-4 h-4 text-green-600" />
                      ) : (
                        <Bus className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {eta.busNumber}
                      </div>
                      <div className="text-xs text-gray-500">{eta.busType}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        eta.realETA <= 5 ? "text-emerald-600" : "text-gray-900"
                      )}
                    >
                      {eta.realETA < 1 ? (
                        <span className="text-emerald-600">Arriving</span>
                      ) : (
                        `${eta.realETA} min`
                      )}
                    </div>
                    {eta.delay > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                        {eta.delay} min delay
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {eta.stopsAway} stops away
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        eta.status === 'ON_TIME' && "border-emerald-500 text-emerald-600",
                        eta.status === 'DELAYED' && "border-amber-500 text-amber-600",
                        eta.status === 'ARRIVING' && "border-sky-500 text-sky-600"
                      )}
                    >
                      {eta.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-gray-400 text-xs">
                    Scheduled: {eta.scheduledETA} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh button */}
        <div className="p-4 border-t border-gray-100">
          <Button
            onClick={fetchETAs}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={loading}
          >
            <Clock className="w-4 h-4 mr-2" />
            Refresh ETAs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
