'use client';

import { useState, useMemo } from 'react';
import { BusRoute } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Search, Navigation, Plane, Building, Clock, X, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavoritesStore } from '@/stores/favorites-store';

interface RouteSelectorProps {
  routes: BusRoute[];
  selectedRoute: BusRoute | null;
  onRouteSelect: (route: BusRoute) => void;
}

const categories = [
  { id: 'all', label: 'All', icon: Bus, color: 'from-slate-500 to-slate-600' },
  { id: 'favorites', label: 'Saved', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'city', label: 'City', icon: Building, color: 'from-blue-500 to-indigo-600' },
  { id: 'airport', label: 'Airport', icon: Plane, color: 'from-purple-500 to-violet-600' },
  { id: 'suburban', label: 'Suburban', icon: Navigation, color: 'from-orange-500 to-amber-600' },
  { id: 'express', label: 'Express', icon: Zap, color: 'from-cyan-500 to-teal-600' },
];

export function RouteSelector({ routes, selectedRoute, onRouteSelect }: RouteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { favoriteRoutes, addFavoriteRoute, removeFavoriteRoute, isFavoriteRoute } = useFavoritesStore();

  const filteredRoutes = useMemo(() => {
    let filtered = routes;

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
        r.routeName.toLowerCase().includes('express') || r.baseFare >= 22
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
    <Card className="h-full flex flex-col border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-r from-emerald-500 to-teal-600">
        <CardTitle className="text-lg flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <MapPin className="w-4 h-4" />
            </div>
            <span>Routes</span>
          </div>
          <Badge className="bg-white/20 text-white border-0 text-xs px-2.5 py-1">
            {routes.length}
          </Badge>
        </CardTitle>
        
        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routes, stops..."
            className="pl-9 h-10 text-sm bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 rounded-xl pr-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-white/20 text-white/80"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      {/* Categories */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200",
                  isActive 
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-md` 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Route List */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto scrollbar-hide">
          {filteredRoutes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">No routes found</p>
              <p className="text-xs text-slate-400 mt-1">Try a different search or category</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRoutes.map((route, index) => {
                const isFavorite = isFavoriteRoute(route.id);
                const isSelected = selectedRoute?.id === route.id;
                
                return (
                  <div
                    key={route.id}
                    onClick={() => onRouteSelect(route)}
                    className={cn(
                      "w-full text-left px-4 py-3 transition-all duration-200 cursor-pointer group relative overflow-hidden",
                      "hover:bg-emerald-50/80",
                      isSelected && "bg-emerald-50"
                    )}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
                    )}
                    
                    <div className="flex items-start gap-3">
                      {/* Route badge */}
                      <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-sm",
                        isSelected 
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                          : "bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 border border-slate-200"
                      )}>
                        <span className="text-xs font-bold leading-none">{route.routeNumber}</span>
                        <span className="text-[8px] opacity-70 mt-0.5">Route</span>
                      </div>
                      
                      {/* Route info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800 truncate text-sm">
                            {route.routeName}
                          </span>
                          {isFavorite && (
                            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-emerald-500" />
                            {route.startPoint}
                          </span>
                          <span className="text-slate-300">→</span>
                          <span className="truncate">{route.endPoint}</span>
                        </div>
                        
                        {/* Meta info */}
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-slate-100 text-slate-600">
                            <Bus className="w-2.5 h-2.5 mr-1" />
                            {route.buses?.length || 0}
                          </Badge>
                          <span className="text-[10px] text-slate-400">
                            {route.distance}km
                          </span>
                          <span className="text-[10px] font-medium text-emerald-600">
                            ₹{route.baseFare}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isFavorite) removeFavoriteRoute(route.id);
                            else addFavoriteRoute({ id: route.id, routeNumber: route.routeNumber, routeName: route.routeName });
                          }}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            isFavorite 
                              ? "text-pink-500 bg-pink-50 hover:bg-pink-100" 
                              : "text-slate-300 hover:text-pink-400 hover:bg-pink-50 opacity-0 group-hover:opacity-100"
                          )}
                        >
                          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                        </button>
                        
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                          isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                        )}>
                          <Navigation className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Stops preview */}
                    <div className="mt-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
                      {route.stops.slice(0, 4).map((stop, i) => (
                        <div key={stop.id} className="flex items-center">
                          {i > 0 && <div className="w-3 h-px bg-emerald-200" />}
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap",
                            stop.isMajor 
                              ? "bg-emerald-100 text-emerald-700 font-medium" 
                              : "bg-slate-100 text-slate-500"
                          )}>
                            {stop.name}
                          </span>
                        </div>
                      ))}
                      {route.stops.length > 4 && (
                        <span className="text-[9px] text-slate-400 ml-1 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 rounded">
                          +{route.stops.length - 4} more
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
