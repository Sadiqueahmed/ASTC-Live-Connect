'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { BusRoute, Bus, TrafficZone, CommunityReport, LiveBusLocation } from '@/components/astc/types';
import { RouteSelector } from '@/components/astc/route-selector';
import { StopETAPanel } from '@/components/astc/stop-eta-panel';
import { CommunityObserver } from '@/components/astc/community-observer';
import { TrafficZonesPanel } from '@/components/astc/traffic-zones-panel';
import { FavoritesPanel } from '@/components/astc/favorites-panel';
import { NearestStopsPanel } from '@/components/astc/nearest-stops-panel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bus as BusIcon, 
  MapPin, 
  Wifi, 
  Clock, 
  Users, 
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Route,
  Heart,
  Navigation,
  WifiOff,
  Crosshair
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket, convertToLiveLocation } from '@/hooks/use-socket';

// Dynamically import BusMap with SSR disabled (Leaflet requires window)
const BusMap = dynamic(
  () => import('@/components/astc/bus-map').then((mod) => mod.BusMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-emerald-700 font-medium">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [trafficZones, setTrafficZones] = useState<TrafficZone[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRoutePanelOpen, setIsRoutePanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState('eta');

  // WebSocket connection for real-time updates
  const { 
    isConnected: isSocketConnected, 
    busPositions, 
    trafficAlerts,
    subscribeToRoute,
    unsubscribeFromRoute,
    lastUpdate: socketLastUpdate 
  } = useSocket();

  // Merge real-time bus positions with base bus data
  const liveBuses = useMemo(() => {
    if (!isSocketConnected || busPositions.length === 0) {
      return buses;
    }

    const positionMap = new Map(busPositions.map(p => [p.busId, p]));

    return buses.map(bus => {
      const position = positionMap.get(bus.id);
      if (position) {
        return {
          ...bus,
          isActive: true,
          liveLocation: convertToLiveLocation(position),
        };
      }
      return bus;
    });
  }, [buses, busPositions, isSocketConnected]);

  // Subscribe to route updates when selected route changes
  useEffect(() => {
    if (selectedRoute && isSocketConnected) {
      subscribeToRoute(selectedRoute.id);
      return () => {
        unsubscribeFromRoute(selectedRoute.id);
      };
    }
  }, [selectedRoute, isSocketConnected, subscribeToRoute, unsubscribeFromRoute]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [routesRes, busesRes, zonesRes, reportsRes] = await Promise.all([
        fetch('/api/routes'),
        fetch('/api/buses'),
        fetch('/api/traffic-zones'),
        fetch('/api/reports?limit=20'),
      ]);

      const routesData = await routesRes.json();
      const busesData = await busesRes.json();
      const zonesData = await zonesRes.json();
      const reportsData = await reportsRes.json();

      if (routesData.success) setRoutes(routesData.data);
      if (busesData.success) setBuses(busesData.data);
      if (zonesData.success) setTrafficZones(zonesData.data);
      if (reportsData.success) setReports(reportsData.data);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
    // Refresh static data every 2 minutes (real-time comes from WebSocket)
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handle report submission
  const handleReportSubmit = async (report: {
    busId: string | null;
    reportType: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    delayMinutes: number;
    trafficZoneId: string | null;
  }) => {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    
    const data = await response.json();
    if (data.success) {
      setReports((prev) => [data.data, ...prev].slice(0, 20));
    }
  };

  // Calculate stats
  const stats = {
    activeBuses: liveBuses.filter(b => b.isActive).length,
    activeRoutes: routes.filter(r => r.isActive).length,
    severeZones: trafficZones.filter(z => z.severity === 'SEVERE' || z.severity === 'HIGH').length,
    recentReports: reports.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading ASTC Live Connect...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <BusIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ASTC Live Connect</h1>
                <p className="text-xs text-white/80">Smart Public Transport Sync for Guwahati</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Stats badges */}
              <div className="hidden md:flex items-center gap-3">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 gap-1">
                  <BusIcon className="w-3 h-3" />
                  {stats.activeBuses} Buses
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 gap-1">
                  <MapPin className="w-3 h-3" />
                  {stats.activeRoutes} Routes
                </Badge>
                {stats.severeZones > 0 && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {stats.severeZones} Hotspots
                  </Badge>
                )}
              </div>

              {/* Connection status */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                </button>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  isSocketConnected ? "bg-white/10" : "bg-red-500/30"
                )}>
                  {isSocketConnected ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs font-medium">LIVE</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span className="text-xs font-medium">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        <div className="flex gap-4 h-[calc(100vh-140px)]">
          {/* Collapsible Route Panel */}
          <div 
            className={cn(
              "transition-all duration-300 ease-in-out flex-shrink-0",
              isRoutePanelOpen ? "w-80" : "w-12"
            )}
          >
            {isRoutePanelOpen ? (
              <div className="h-full relative">
                <RouteSelector
                  routes={routes}
                  selectedRoute={selectedRoute}
                  onRouteSelect={(route) => {
                    setSelectedRoute(route);
                    setSelectedStop(null);
                  }}
                />
                {/* Collapse button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-3 right-3 z-10 h-7 w-7"
                  onClick={() => setIsRoutePanelOpen(false)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              /* Collapsed state - vertical button */
              <div className="h-full flex flex-col items-center">
                <Button
                  variant="outline"
                  className="h-full w-full flex flex-col items-center justify-center gap-2 py-4 bg-white shadow-sm hover:bg-emerald-50 border-emerald-200"
                  onClick={() => setIsRoutePanelOpen(true)}
                >
                  <Route className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700 writing-mode-vertical">
                    Routes
                  </span>
                  <ChevronRight className="w-4 h-4 text-emerald-600" />
                </Button>
              </div>
            )}
          </div>

          {/* Center - Map */}
          <div className="flex-1 min-w-0">
            <Card className="h-full overflow-hidden">
              <CardContent className="p-0 h-full">
                <BusMap
                  route={selectedRoute}
                  buses={liveBuses}
                  trafficZones={trafficZones}
                  selectedStop={selectedStop}
                  onStopSelect={setSelectedStop}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right panel - ETA, Favorites, Nearest Stops, Community */}
          <div className="w-80 flex-shrink-0 hidden lg:flex flex-col gap-4">
            <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="eta" className="text-xs px-2">
                  <Clock className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="nearest" className="text-xs px-2">
                  <Crosshair className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="favorites" className="text-xs px-2">
                  <Heart className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="community" className="text-xs px-2">
                  <Users className="w-3 h-3" />
                </TabsTrigger>
              </TabsList>
              <TabsContent value="eta" className="flex-1 mt-2">
                <StopETAPanel
                  route={selectedRoute}
                  selectedStopId={selectedStop}
                />
              </TabsContent>
              <TabsContent value="nearest" className="flex-1 mt-2">
                <NearestStopsPanel
                  routes={routes}
                  onRouteSelect={(route) => {
                    setSelectedRoute(route);
                    setSelectedStop(null);
                  }}
                  onStopSelect={setSelectedStop}
                />
              </TabsContent>
              <TabsContent value="favorites" className="flex-1 mt-2">
                <FavoritesPanel
                  routes={routes}
                  onRouteSelect={(route) => {
                    setSelectedRoute(route);
                    setSelectedStop(null);
                  }}
                  onStopSelect={setSelectedStop}
                />
              </TabsContent>
              <TabsContent value="community" className="flex-1 mt-2">
                <CommunityObserver
                  reports={reports}
                  routes={routes}
                  trafficZones={trafficZones}
                  onReportSubmit={handleReportSubmit}
                />
              </TabsContent>
            </Tabs>

            {/* Traffic zones mini panel */}
            <div className="flex-shrink-0" style={{ maxHeight: '200px' }}>
              <TrafficZonesPanel zones={trafficZones} />
            </div>
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="flex items-center justify-around py-2">
            <Button
              variant={selectedRoute ? "ghost" : "default"}
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => setIsRoutePanelOpen(!isRoutePanelOpen)}
            >
              <Route className="w-5 h-5" />
              <span className="text-xs">Routes</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => setRightPanelTab('nearest')}
            >
              <Crosshair className="w-5 h-5" />
              <span className="text-xs">Nearby</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => setRightPanelTab('eta')}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs">ETA</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => setRightPanelTab('favorites')}
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs">Saved</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => setRightPanelTab('community')}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">Observe</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-3 px-4 mt-auto hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <BusIcon className="w-4 h-4 text-emerald-400" />
            <span>ASTC Live Connect</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400 text-xs">Community-Powered Transport Sync</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>
              Last updated: {socketLastUpdate?.toLocaleTimeString() || lastUpdate.toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1">
              {isSocketConnected ? (
                <>
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">Real-time</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline Mode</span>
                </>
              )}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
