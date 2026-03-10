'use client';

import { useState } from 'react';
import { useFavoritesStore, FavoriteRoute, FavoriteStop } from '@/stores/favorites-store';
import { BusRoute } from '@/components/astc/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  Star, 
  MapPin, 
  Route, 
  Trash2, 
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoritesPanelProps {
  routes: BusRoute[];
  onRouteSelect: (route: BusRoute) => void;
  onStopSelect: (stopId: string) => void;
}

export function FavoritesPanel({ routes, onRouteSelect, onStopSelect }: FavoritesPanelProps) {
  const { favoriteRoutes, favoriteStops, removeFavoriteRoute, removeFavoriteStop } = useFavoritesStore();
  const [activeTab, setActiveTab] = useState<'routes' | 'stops'>('routes');

  const hasFavorites = favoriteRoutes.length > 0 || favoriteStops.length > 0;

  if (!hasFavorites) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Favorites
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-pink-300" />
          </div>
          <p className="text-gray-600 font-medium mb-1">No favorites yet</p>
          <p className="text-xs text-gray-400 max-w-[200px]">
            Star your frequently used routes and stops for quick access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Favorites
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {favoriteRoutes.length + favoriteStops.length}
          </Badge>
        </div>
        
        {/* Tab switcher */}
        <div className="flex gap-1 mt-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('routes')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
              activeTab === 'routes' 
                ? "bg-white shadow-sm text-emerald-700" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Route className="w-3.5 h-3.5" />
            Routes ({favoriteRoutes.length})
          </button>
          <button
            onClick={() => setActiveTab('stops')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
              activeTab === 'stops' 
                ? "bg-white shadow-sm text-emerald-700" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <MapPin className="w-3.5 h-3.5" />
            Stops ({favoriteStops.length})
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {activeTab === 'routes' ? (
            <div className="divide-y divide-gray-100">
              {favoriteRoutes.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No favorite routes
                </div>
              ) : (
                favoriteRoutes.map((favRoute) => {
                  const fullRoute = routes.find(r => r.id === favRoute.id);
                  return (
                    <div
                      key={favRoute.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer group"
                      onClick={() => fullRoute && onRouteSelect(fullRoute)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Route className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                                {favRoute.routeNumber}
                              </Badge>
                              <span className="font-medium text-sm text-gray-900">
                                {favRoute.routeName}
                              </span>
                            </div>
                            {fullRoute && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {fullRoute.distance} km • {fullRoute.stops.length} stops
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavoriteRoute(favRoute.id);
                            }}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {favoriteStops.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No favorite stops
                </div>
              ) : (
                favoriteStops.map((favStop) => (
                  <div
                    key={favStop.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => {
                      const parentRoute = routes.find(r => r.id === favStop.routeId);
                      if (parentRoute) {
                        onRouteSelect(parentRoute);
                        setTimeout(() => onStopSelect(favStop.id), 100);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-pink-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {favStop.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {favStop.routeNumber && (
                              <Badge className="bg-gray-100 text-gray-600 text-[10px]">
                                {favStop.routeNumber}
                              </Badge>
                            )}
                            {favStop.landmark && (
                              <span className="text-xs text-gray-400">
                                {favStop.landmark}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavoriteStop(favStop.id);
                          }}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Favorite button component for routes
interface FavoriteRouteButtonProps {
  route: BusRoute;
}

export function FavoriteRouteButton({ route }: FavoriteRouteButtonProps) {
  const { addFavoriteRoute, removeFavoriteRoute, isFavoriteRoute } = useFavoritesStore();
  const isFavorite = isFavoriteRoute(route.id);

  const handleToggle = () => {
    if (isFavorite) {
      removeFavoriteRoute(route.id);
    } else {
      addFavoriteRoute({
        id: route.id,
        routeNumber: route.routeNumber,
        routeName: route.routeName,
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={cn(
        "gap-1 h-8",
        isFavorite ? "text-pink-500 hover:text-pink-600 hover:bg-pink-50" : "text-gray-400 hover:text-pink-500"
      )}
    >
      <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
      <span className="text-xs">{isFavorite ? 'Saved' : 'Save'}</span>
    </Button>
  );
}

// Favorite button component for stops
interface FavoriteStopButtonProps {
  stop: {
    id: string;
    name: string;
    landmark: string | null;
    latitude: number;
    longitude: number;
    routeId: string;
  };
  routeNumber?: string;
}

export function FavoriteStopButton({ stop, routeNumber }: FavoriteStopButtonProps) {
  const { addFavoriteStop, removeFavoriteStop, isFavoriteStop } = useFavoritesStore();
  const isFavorite = isFavoriteStop(stop.id);

  const handleToggle = () => {
    if (isFavorite) {
      removeFavoriteStop(stop.id);
    } else {
      addFavoriteStop({
        id: stop.id,
        name: stop.name,
        landmark: stop.landmark,
        latitude: stop.latitude,
        longitude: stop.longitude,
        routeId: stop.routeId,
        routeNumber,
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={cn(
        "gap-1 h-7",
        isFavorite ? "text-pink-500 hover:text-pink-600 hover:bg-pink-50" : "text-gray-400 hover:text-pink-500"
      )}
    >
      <Heart className={cn("w-3.5 h-3.5", isFavorite && "fill-current")} />
    </Button>
  );
}
