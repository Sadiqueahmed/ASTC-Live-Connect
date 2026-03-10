'use client';

import { useState } from 'react';
import { useFavoritesStore } from '@/stores/favorites-store';
import { BusRoute } from '@/components/astc/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/badge';
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
  Sparkles,
  Bookmark
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
      <Card className="h-full border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
        <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-r from-pink-500 to-rose-500">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Heart className="w-4 h-4" />
            </div>
            Favorites
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center bg-gradient-to-br from-pink-50/50 to-rose-50/30">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mb-4">
            <Bookmark className="w-10 h-10 text-pink-300" />
          </div>
          <p className="text-slate-600 font-semibold mb-1">No favorites yet</p>
          <p className="text-xs text-slate-400 max-w-[200px]">
            Star your frequently used routes and stops for quick access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
      <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-pink-500 to-rose-500">
        <CardTitle className="text-lg flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Heart className="w-4 h-4" />
            </div>
            <span>Favorites</span>
          </div>
          <Badge className="bg-white/20 text-white border-0 text-xs">
            {favoriteRoutes.length + favoriteStops.length}
          </Badge>
        </CardTitle>
        
        {/* Tab switcher */}
        <div className="flex gap-1 mt-3 bg-white/20 rounded-xl p-1">
          {[
            { id: 'routes', label: 'Routes', count: favoriteRoutes.length },
            { id: 'stops', label: 'Stops', count: favoriteStops.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'routes' | 'stops')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-white text-rose-600 shadow-sm" 
                  : "text-white/70 hover:text-white"
              )}
            >
              {tab.id === 'routes' ? <Route className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {activeTab === 'routes' ? (
            favoriteRoutes.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No favorite routes
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {favoriteRoutes.map((favRoute, index) => {
                  const fullRoute = routes.find(r => r.id === favRoute.id);
                  return (
                    <div
                      key={favRoute.id}
                      onClick={() => fullRoute && onRouteSelect(fullRoute)}
                      className="p-4 hover:bg-rose-50/50 cursor-pointer group animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                            <Route className="w-5 h-5 text-rose-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-rose-100 text-rose-700 text-[10px] font-bold">
                                {favRoute.routeNumber}
                              </Badge>
                              <span className="font-semibold text-slate-800 text-sm">
                                {favRoute.routeName}
                              </span>
                            </div>
                            {fullRoute && (
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>{fullRoute.distance} km</span>
                                <span>•</span>
                                <span>{fullRoute.stops.length} stops</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavoriteRoute(favRoute.id);
                            }}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            favoriteStops.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No favorite stops
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {favoriteStops.map((favStop, index) => (
                  <div
                    key={favStop.id}
                    onClick={() => {
                      const parentRoute = routes.find(r => r.id === favStop.routeId);
                      if (parentRoute) {
                        onRouteSelect(parentRoute);
                        setTimeout(() => onStopSelect(favStop.id), 100);
                      }
                    }}
                    className="p-4 hover:bg-rose-50/50 cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">
                            {favStop.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {favStop.routeNumber && (
                              <Badge className="bg-slate-100 text-slate-600 text-[10px]">
                                {favStop.routeNumber}
                              </Badge>
                            )}
                            {favStop.landmark && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                                {favStop.landmark}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-pink-500 transition-colors" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavoriteStop(favStop.id);
                          }}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
