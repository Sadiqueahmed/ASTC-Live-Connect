'use client';

import { useMemo } from 'react';
import { useGeolocation, NearestStop } from '@/hooks/use-geolocation';
import { BusRoute, BusStop } from '@/components/astc/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  Navigation, 
  Crosshair, 
  Loader2,
  ChevronRight,
  AlertCircle,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NearestStopsPanelProps {
  routes: BusRoute[];
  onRouteSelect: (route: BusRoute) => void;
  onStopSelect: (stopId: string) => void;
}

function useFlattenStops(routes: BusRoute[]): (BusStop & { routeNumber: string; routeName: string })[] {
  return useMemo(() => {
    const stopsMap = new Map<string, BusStop & { routeNumber: string; routeName: string }>();
    routes.forEach(route => {
      route.stops.forEach(stop => {
        if (!stopsMap.has(stop.id)) {
          stopsMap.set(stop.id, { ...stop, routeNumber: route.routeNumber, routeName: route.routeName });
        }
      });
    });
    return Array.from(stopsMap.values());
  }, [routes]);
}

export function NearestStopsPanel({ routes, onRouteSelect, onStopSelect }: NearestStopsPanelProps) {
  const allStops = useFlattenStops(routes);
  const { userLocation, isLoading, error, nearestStops, requestLocation } = useGeolocation(allStops);

  const handleStopClick = (nearestStop: NearestStop) => {
    const parentRoute = routes.find(r => r.id === nearestStop.stop.routeId);
    if (parentRoute) {
      onRouteSelect(parentRoute);
      setTimeout(() => onStopSelect(nearestStop.stop.id), 100);
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) return `${Math.round(distance * 1000)} m`;
    return `${distance.toFixed(1)} km`;
  };

  return (
    <Card className="h-full flex flex-col border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
      <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-blue-500 to-cyan-500">
        <CardTitle className="text-lg flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Navigation className="w-4 h-4" />
            </div>
            <span>Nearby Stops</span>
          </div>
          {!isLoading && userLocation && (
            <Badge className="bg-white/20 text-white border-0 text-[10px] gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              GPS Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-blue-50/50 to-cyan-50/30">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
            <p className="text-slate-600 font-medium">Getting your location</p>
            <p className="text-xs text-slate-400 mt-1">Please wait...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-gradient-to-br from-red-50/50 to-orange-50/30">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">Location Required</p>
            <p className="text-xs text-slate-400 mb-4 max-w-[200px]">{error}</p>
            <Button onClick={requestLocation} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg shadow-blue-500/25">
              <Crosshair className="w-4 h-4 mr-2" />
              Enable Location
            </Button>
          </div>
        ) : !userLocation ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-gradient-to-br from-blue-50/50 to-cyan-50/30">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-4">
              <Compass className="w-10 h-10 text-blue-400 animate-float" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">Find Nearby Stops</p>
            <p className="text-xs text-slate-400 mb-5 max-w-[200px]">
              Enable location to discover bus stops within walking distance
            </p>
            <Button onClick={requestLocation} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg shadow-blue-500/25">
              <Crosshair className="w-4 h-4 mr-2" />
              Get My Location
            </Button>
          </div>
        ) : nearestStops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No stops nearby</p>
            <p className="text-xs text-slate-400 mt-1">Try expanding your search radius</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="divide-y divide-slate-100">
              {nearestStops.map((nearestStop, index) => (
                <div
                  key={`${nearestStop.stop.id}-${index}`}
                  onClick={() => handleStopClick(nearestStop)}
                  className="p-4 hover:bg-blue-50/50 cursor-pointer group transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    {/* Distance badge */}
                    <div className={cn(
                      "relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                      index === 0 
                        ? "bg-gradient-to-br from-emerald-100 to-teal-100" 
                        : "bg-gradient-to-br from-blue-50 to-cyan-50 border border-slate-200"
                    )}>
                      <div className={cn(
                        "text-center",
                        index === 0 ? "text-emerald-600" : "text-blue-600"
                      )}>
                        <div className="text-sm font-bold leading-none">{formatDistance(nearestStop.distance)}</div>
                        <div className="text-[8px] opacity-60 mt-0.5">away</div>
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">1</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Stop info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm truncate">
                        {nearestStop.stop.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-slate-100 text-slate-600 text-[10px] font-medium">
                          {nearestStop.routeNumber}
                        </Badge>
                        {nearestStop.stop.landmark && (
                          <span className="text-xs text-slate-400 truncate max-w-[100px]">
                            {nearestStop.stop.landmark}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Accuracy info */}
            {userLocation && (
              <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Crosshair className="w-3 h-3" />
                  <span>Accuracy: ±{Math.round(userLocation.accuracy)}m</span>
                  <span className="text-slate-200">•</span>
                  <span>Updated: {userLocation.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
