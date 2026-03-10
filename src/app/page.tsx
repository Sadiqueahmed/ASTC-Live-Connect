'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { BusRoute, Bus, TrafficZone, CommunityReport } from '@/components/astc/types';
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
  Crosshair,
  WifiOff,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket, convertToLiveLocation } from '@/hooks/use-socket';

// Dynamically import BusMap with SSR disabled
const BusMap = dynamic(
  () => import('@/components/astc/bus-map').then((mod) => mod.BusMap),
  { 
    ssr: false,
    loading: () => <MapLoadingState />
  }
);

function MapLoadingState() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-30" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
            <BusIcon className="w-10 h-10 text-white" />
          </div>
        </div>
        <p className="text-emerald-700 font-semibold text-lg">Loading Map</p>
        <p className="text-emerald-600/60 text-sm mt-1">Preparing live tracking...</p>
      </div>
    </div>
  );
}

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

  const { 
    isConnected: isSocketConnected, 
    busPositions, 
    subscribeToRoute,
    unsubscribeFromRoute,
    lastUpdate: socketLastUpdate 
  } = useSocket();

  const liveBuses = useMemo(() => {
    if (!isSocketConnected || busPositions.length === 0) return buses;
    const positionMap = new Map(busPositions.map(p => [p.busId, p]));
    return buses.map(bus => {
      const position = positionMap.get(bus.id);
      return position ? { ...bus, isActive: true, liveLocation: convertToLiveLocation(position) } : bus;
    });
  }, [buses, busPositions, isSocketConnected]);

  useEffect(() => {
    if (selectedRoute && isSocketConnected) {
      subscribeToRoute(selectedRoute.id);
      return () => unsubscribeFromRoute(selectedRoute.id);
    }
  }, [selectedRoute, isSocketConnected, subscribeToRoute, unsubscribeFromRoute]);

  const fetchData = useCallback(async () => {
    try {
      const [routesRes, busesRes, zonesRes, reportsRes] = await Promise.all([
        fetch('/api/routes'), fetch('/api/buses'), fetch('/api/traffic-zones'), fetch('/api/reports?limit=20'),
      ]);
      const [routesData, busesData, zonesData, reportsData] = await Promise.all([
        routesRes.json(), busesRes.json(), zonesRes.json(), reportsRes.json()
      ]);
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleReportSubmit = async (report: object) => {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    const data = await response.json();
    if (data.success) setReports((prev) => [data.data, ...prev].slice(0, 20));
  };

  const stats = {
    activeBuses: liveBuses.filter(b => b.isActive).length,
    activeRoutes: routes.filter(r => r.isActive).length,
    severeZones: trafficZones.filter(z => z.severity === 'SEVERE' || z.severity === 'HIGH').length,
    recentReports: reports.length,
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 flex flex-col">
      {/* Animated background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl blur-sm opacity-50" />
                <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg">
                  <BusIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ASTC Live Connect
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Smart Transport for Guwahati
                </p>
              </div>
            </div>

            {/* Stats & Controls */}
            <div className="flex items-center gap-3">
              {/* Stats badges */}
              <div className="hidden md:flex items-center gap-2">
                <StatBadge icon={BusIcon} value={stats.activeBuses} label="Buses" color="emerald" />
                <StatBadge icon={MapPin} value={stats.activeRoutes} label="Routes" color="teal" />
                {stats.severeZones > 0 && (
                  <StatBadge icon={AlertTriangle} value={stats.severeZones} label="Hotspots" color="red" pulse />
                )}
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-8 bg-slate-200" />

              {/* Refresh & Status */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-emerald-50"
                >
                  <RefreshCw className={cn("w-4 h-4 text-slate-600", isRefreshing && "animate-spin")} />
                </Button>
                
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300",
                  isSocketConnected 
                    ? "bg-emerald-50 border border-emerald-200" 
                    : "bg-red-50 border border-red-200"
                )}>
                  {isSocketConnected ? (
                    <>
                      <div className="relative">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">LIVE</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs font-semibold text-red-600">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        <div className="flex gap-4 h-[calc(100vh-140px)]">
          {/* Route Panel */}
          <div className={cn(
            "transition-all duration-300 ease-in-out flex-shrink-0",
            isRoutePanelOpen ? "w-80" : "w-12"
          )}>
            {isRoutePanelOpen ? (
              <div className="h-full relative animate-fade-in">
                <RouteSelector
                  routes={routes}
                  selectedRoute={selectedRoute}
                  onRouteSelect={(route) => {
                    setSelectedRoute(route);
                    setSelectedStop(null);
                  }}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-3 right-3 z-10 h-8 w-8 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm hover:bg-slate-50"
                  onClick={() => setIsRoutePanelOpen(false)}
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </Button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center animate-scale-in">
                <Button
                  variant="outline"
                  className="h-full w-full flex flex-col items-center justify-center gap-2 py-4 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-emerald-50 border-emerald-200 rounded-2xl"
                  onClick={() => setIsRoutePanelOpen(true)}
                >
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                    <Route className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-emerald-700 writing-mode-vertical">
                    Routes
                  </span>
                  <ChevronRight className="w-4 h-4 text-emerald-600" />
                </Button>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 min-w-0 animate-scale-in">
            <Card className="h-full overflow-hidden border-0 shadow-xl rounded-2xl">
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

          {/* Right Panel */}
          <div className="w-80 flex-shrink-0 hidden lg:flex flex-col gap-4 animate-fade-in">
            <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-4 w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-1 h-auto">
                <TabsTrigger value="eta" className="rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  <Clock className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="nearest" className="rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  <Crosshair className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="favorites" className="rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  <Heart className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="community" className="rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  <Users className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
              
              {[
                { value: 'eta', component: <StopETAPanel route={selectedRoute} selectedStopId={selectedStop} /> },
                { value: 'nearest', component: <NearestStopsPanel routes={routes} onRouteSelect={(r) => { setSelectedRoute(r); setSelectedStop(null); }} onStopSelect={setSelectedStop} /> },
                { value: 'favorites', component: <FavoritesPanel routes={routes} onRouteSelect={(r) => { setSelectedRoute(r); setSelectedStop(null); }} onStopSelect={setSelectedStop} /> },
                { value: 'community', component: <CommunityObserver reports={reports} routes={routes} trafficZones={trafficZones} onReportSubmit={handleReportSubmit} /> },
              ].map(({ value, component }) => (
                <TabsContent key={value} value={value} className="flex-1 mt-3">
                  {component}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex-shrink-0" style={{ maxHeight: '200px' }}>
              <TrafficZonesPanel zones={trafficZones} />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNav 
          selectedRoute={selectedRoute}
          activeTab={rightPanelTab}
          onToggleRoutes={() => setIsRoutePanelOpen(!isRoutePanelOpen)}
          onTabChange={setRightPanelTab}
        />
      </main>

      {/* Footer */}
      <footer className="relative bg-slate-900 text-white py-3 px-4 mt-auto hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-lg">
                <BusIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">ASTC Live Connect</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-xs">Community-Powered Transport Sync</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Updated: {socketLastUpdate?.toLocaleTimeString() || lastUpdate.toLocaleTimeString()}
            </span>
            <span className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full",
              isSocketConnected ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
            )}>
              {isSocketConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isSocketConnected ? 'Real-time' : 'Offline'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Stat Badge Component
function StatBadge({ icon: Icon, value, label, color, pulse }: { 
  icon: React.ElementType; 
  value: number; 
  label: string;
  color: 'emerald' | 'teal' | 'red';
  pulse?: boolean;
}) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };
  
  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl border", colors[color])}>
      <Icon className={cn("w-3.5 h-3.5", pulse && "animate-pulse")} />
      <span className="font-bold text-sm">{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-emerald-200 rounded-2xl animate-ping opacity-30" />
          <div className="absolute inset-0 bg-emerald-100 rounded-2xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <BusIcon className="w-12 h-12 text-white animate-float" />
          </div>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
          ASTC Live Connect
        </h2>
        <p className="text-slate-500">Loading smart transport sync...</p>
        <div className="flex items-center justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile Navigation
function MobileNav({ selectedRoute, activeTab, onToggleRoutes, onTabChange }: {
  selectedRoute: BusRoute | null;
  activeTab: string;
  onToggleRoutes: () => void;
  onTabChange: (tab: string) => void;
}) {
  const tabs = [
    { id: 'routes', icon: Route, label: 'Routes' },
    { id: 'nearest', icon: Crosshair, label: 'Nearby' },
    { id: 'eta', icon: Clock, label: 'ETA' },
    { id: 'favorites', icon: Heart, label: 'Saved' },
    { id: 'community', icon: Users, label: 'Observe' },
  ];
  
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-lg z-40">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => id === 'routes' ? onToggleRoutes() : onTabChange(id)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all",
              (id === 'routes' && selectedRoute) || activeTab === id
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
