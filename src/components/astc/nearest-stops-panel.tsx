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
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NearestStopsPanelProps {
  routes: BusRoute[];
  onRouteSelect: (route: BusRoute) => void;
  onStopSelect: (stopId: string) => void;
}

// Flatten all stops with route info - memoized result
function useFlattenStops(routes: BusRoute[]): (BusStop & { routeNumber: string; routeName: string })[] {
  return useMemo(() => {
    const stopsMap = new Map<string, BusStop & { routeNumber: string; routeName: string }>();
    
    routes.forEach(route => {
      route.stops.forEach(stop => {
        // Only add if not already present
        if (!stopsMap.has(stop.id)) {
          stopsMap.set(stop.id, {
            ...stop,
            routeNumber: route.routeNumber,
            routeName: route.routeName,
          });
        }
      });
    });
    
    return Array.from(stopsMap.values());
  }, [routes]);
}

export function NearestStopsPanel({ routes, onRouteSelect, onStopSelect }: NearestStopsPanelProps) {
  const allStops = useFlattenStops(routes);
  const { 
    userLocation, 
    isLoading, 
    error, 
    nearestStops, 
    requestLocation,
  } = useGeolocation(allStops);

  const handleStopClick = (nearestStop: NearestStop) => {
    const parentRoute = routes.find(r => r.id === nearestStop.stop.routeId);
    if (parentRoute) {
      onRouteSelect(parentRoute);
      setTimeout(() => onStopSelect(nearestStop.stop.id), 100);
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            Nearest Stops
          </CardTitle>
          {!isLoading && userLocation && (
            <Badge variant="outline" className="text-[10px] gap-1 border-blue-200 text-blue-600">
              <Crosshair className="w-3 h-3" />
              GPS Active
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Getting your location...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            <Button 
              onClick={requestLocation}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Crosshair className="w-4 h-4 mr-2" />
              Enable Location
            </Button>
          </div>
        ) : !userLocation ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Crosshair className="w-8 h-8 text-blue-300" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Find stops near you</p>
            <p className="text-xs text-gray-400 mb-4">Enable location to see the nearest bus stops</p>
            <Button 
              onClick={requestLocation}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Crosshair className="w-4 h-4 mr-2" />
              Get My Location
            </Button>
          </div>
        ) : nearestStops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MapPin className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No stops found nearby</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="divide-y divide-gray-100">
              {nearestStops.map((nearestStop, index) => (
                <div
                  key={`${nearestStop.stop.id}-${index}`}
                  className="p-3 hover:bg-gray-50 cursor-pointer group"
                  onClick={() => handleStopClick(nearestStop)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        index === 0 ? "bg-emerald-100" : "bg-blue-50"
                      )}>
                        <div className="text-center">
                          <div className={cn(
                            "text-sm font-bold",
                            index === 0 ? "text-emerald-600" : "text-blue-600"
                          )}>
                            {formatDistance(nearestStop.distance)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {nearestStop.stop.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className="bg-gray-100 text-gray-600 text-[10px]">
                            {nearestStop.routeNumber}
                          </Badge>
                          {nearestStop.stop.landmark && (
                            <span className="text-xs text-gray-400 truncate max-w-[100px]">
                              {nearestStop.stop.landmark}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Location accuracy info */}
            {userLocation && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Crosshair className="w-3 h-3" />
                  <span>
                    Accuracy: ±{Math.round(userLocation.accuracy)}m
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>
                    Updated: {userLocation.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
