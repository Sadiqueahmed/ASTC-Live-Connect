'use client';

import { useState, useMemo } from 'react';
import { BusRoute } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Search, Navigation, Plane, Building, Clock, X, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavoritesStore } from '@/stores/favorites-store';

interface RouteSelectorProps {
  routes: BusRoute[];
  selectedRoute: BusRoute | null;
  onRouteSelect: (route: BusRoute) => void;
}

// Route categories
const categories = [
  { id: 'all', label: 'All', icon: Bus },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'city', label: 'City', icon: Building },
  { id: 'airport', label: 'Airport', icon: Plane },
  { id: 'suburban', label: 'Suburban', icon: Navigation },
  { id: 'express', label: 'Express', icon: Clock },
];

export function RouteSelector({ routes, selectedRoute, onRouteSelect }: RouteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { favoriteRoutes, addFavoriteRoute, removeFavoriteRoute, isFavoriteRoute } = useFavoritesStore();

  // Filter routes based on search and category
  const filteredRoutes = useMemo(() => {
    let filtered = routes;

    // Filter by category
    if (activeCategory === 'favorites') {
      const favoriteIds = new Set(favoriteRoutes.map(f => f.id));
      filtered = filtered.filter(r => favoriteIds.has(r.id));
    } else if (activeCategory === 'airport') {
      filtered = filtered.filter(r => 
        r.routeName.toLowerCase().includes('airport') || 
        r.endPoint.toLowerCase().includes('airport')
      );
    } else if (activeCategory === 'express') {
      filtered = filtered.filter(r => 
        r.routeName.toLowerCase().includes('express') ||
        r.baseFare >= 22
      );
    } else if (activeCategory === 'suburban') {
      filtered = filtered.filter(r => 
        r.routeName.toLowerCase().includes('sualkuchi') ||
        r.routeName.toLowerCase().includes('chandubi') ||
        r.routeName.toLowerCase().includes('amingaon') ||
        r.distance >= 20
      );
    } else if (activeCategory === 'city') {
      filtered = filtered.filter(r => 
        r.distance < 15 &&
        !r.routeName.toLowerCase().includes('airport') &&
        !r.routeName.toLowerCase().includes('express')
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.routeNumber.toLowerCase().includes(query) ||
        r.routeName.toLowerCase().includes(query) ||
        r.startPoint.toLowerCase().includes(query) ||
        r.endPoint.toLowerCase().includes(query) ||
        r.stops.some(s => s.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [routes, searchQuery, activeCategory, favoriteRoutes]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          Bus Routes
          <Badge variant="outline" className="ml-auto text-xs">
            {routes.length}
          </Badge>
        </CardTitle>
        
        {/* Search input */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routes, stops..."
            className="pl-9 h-9 text-sm pr-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mt-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                activeCategory === cat.id
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto scrollbar-thin">
          {filteredRoutes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No routes found</p>
              <p className="text-xs mt-1">Try a different search or category</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRoutes.map((route) => {
                const isFavorite = isFavoriteRoute(route.id);
                return (
                  <div
                    key={route.id}
                    onClick={() => onRouteSelect(route)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 transition-all duration-200 cursor-pointer",
                      "hover:bg-emerald-50 focus:outline-none focus:bg-emerald-50",
                      selectedRoute?.id === route.id && "bg-emerald-100 border-l-4 border-l-emerald-600"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 font-bold shrink-0 text-xs"
                          >
                            {route.routeNumber}
                          </Badge>
                          <span className="font-medium text-gray-900 truncate text-sm">
                            {route.routeName}
                          </span>
                          {isFavorite && (
                            <Heart className="w-3.5 h-3.5 text-pink-500 fill-current shrink-0" />
                          )}
                        </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          {route.startPoint}
                        </span>
                        <span className="text-gray-300">→</span>
                        <span className="truncate">{route.endPoint}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFavorite) {
                            removeFavoriteRoute(route.id);
                          } else {
                            addFavoriteRoute({
                              id: route.id,
                              routeNumber: route.routeNumber,
                              routeName: route.routeName,
                            });
                          }
                        }}
                        className={cn(
                          "p-1.5 rounded-full transition-colors",
                          isFavorite 
                            ? "text-pink-500 hover:bg-pink-50" 
                            : "text-gray-300 hover:text-pink-400 hover:bg-pink-50"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                      </button>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Bus className="w-3 h-3" />
                        <span>{route.buses?.length || 0}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {route.distance}km · ₹{route.baseFare}
                      </div>
                    </div>
                  </div>
                  
                  {/* Route stops preview */}
                  <div className="mt-1.5 flex items-center gap-0.5 overflow-x-auto pb-0.5 scrollbar-hide">
                    {route.stops.slice(0, 4).map((stop, i) => (
                      <div key={stop.id} className="flex items-center">
                        {i > 0 && (
                          <div className="w-2 h-px bg-emerald-300" />
                        )}
                        <span className={cn(
                          "text-[10px] px-1 py-0.5 rounded whitespace-nowrap",
                          stop.isMajor ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                        )}>
                          {stop.name}
                        </span>
                      </div>
                    ))}
                    {route.stops.length > 4 && (
                      <span className="text-[10px] text-gray-400 ml-0.5 whitespace-nowrap">
                        +{route.stops.length - 4}
                      </span>
                    )}
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
