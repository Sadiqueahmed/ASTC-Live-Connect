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
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Sparkles
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
      const interval = setInterval(fetchETAs, 30000);
      return () => clearInterval(interval);
    }
  }, [route, selectedStopId]);

  const fetchETAs = async () => {
    if (!route || !selectedStopId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/eta?routeId=${route.id}&stopId=${selectedStopId}`);
      const data = await response.json();
      if (data.success) setEtas(data.data.upcomingBuses);
    } catch (error) {
      console.error('Error fetching ETAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedStop = route?.stops.find(s => s.id === selectedStopId);

  if (!route || !selectedStopId || !selectedStop) {
    return (
      <Card className="h-full border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-emerald-400" />
            </div>
            <p className="text-slate-600 font-semibold mb-1">No Stop Selected</p>
            <p className="text-sm text-slate-400 max-w-[200px]">
              Click a stop on the map to see bus arrival predictions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-r from-emerald-500 to-teal-600">
        <CardTitle className="text-lg flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">{selectedStop.name}</div>
              {selectedStop.landmark && (
                <div className="text-[10px] text-white/70 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {selectedStop.landmark}
                </div>
              )}
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0 text-xs">
            {route.routeNumber}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : etas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <Bus className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No upcoming buses</p>
            <p className="text-xs text-slate-400 mt-1">Check back in a few minutes</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {etas.map((eta, index) => (
              <div
                key={eta.busId}
                className={cn(
                  "p-4 transition-all duration-200 animate-fade-in",
                  index === 0 && "bg-gradient-to-r from-emerald-50 to-teal-50"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {index === 0 && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-semibold mb-2 uppercase tracking-wide">
                    <Sparkles className="w-3 h-3" />
                    Next Arrival
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Bus icon */}
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shadow-sm",
                      eta.busType === 'AC' && "bg-gradient-to-br from-sky-400 to-blue-500",
                      eta.busType === 'ELECTRIC' && "bg-gradient-to-br from-emerald-400 to-green-500",
                      eta.busType === 'STANDARD' && "bg-gradient-to-br from-amber-400 to-orange-500",
                      eta.busType === 'MINI' && "bg-gradient-to-br from-purple-400 to-violet-500"
                    )}>
                      {eta.busType === 'AC' ? (
                        <Snowflake className="w-5 h-5 text-white" />
                      ) : eta.busType === 'ELECTRIC' ? (
                        <Zap className="w-5 h-5 text-white" />
                      ) : (
                        <Bus className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-bold text-slate-800">{eta.busNumber}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{eta.busType}</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {eta.stopsAway} stops away
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* ETA */}
                  <div className="text-right">
                    <div className={cn(
                      "text-3xl font-bold tabular-nums",
                      eta.realETA <= 5 ? "text-emerald-500" : "text-slate-800"
                    )}>
                      {eta.realETA < 1 ? (
                        <span className="text-lg text-emerald-600">Now</span>
                      ) : (
                        <span>{eta.realETA}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">minutes</div>
                    {eta.delay > 0 && (
                      <div className="flex items-center justify-end gap-1 text-xs text-amber-600 mt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        +{eta.delay} min delay
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status bar */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-medium",
                    eta.status === 'ON_TIME' && "border-emerald-200 text-emerald-600 bg-emerald-50",
                    eta.status === 'DELAYED' && "border-amber-200 text-amber-600 bg-amber-50",
                    eta.status === 'ARRIVING' && "border-sky-200 text-sky-600 bg-sky-50"
                  )}>
                    {eta.status.replace('_', ' ')}
                  </Badge>
                  <div className="text-[10px] text-slate-400">
                    Scheduled: {eta.scheduledETA} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <Button
            onClick={fetchETAs}
            variant="outline"
            size="sm"
            className="w-full rounded-xl border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh Predictions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
