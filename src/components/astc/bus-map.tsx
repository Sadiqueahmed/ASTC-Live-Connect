'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BusRoute, Bus, TrafficZone } from './types';
import { BusIcon, AlertTriangle, Zap, Snowflake, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Fix for default marker icons in Leaflet with Next.js
const createIcon = (html: string, iconSize: [number, number] = [24, 24], iconAnchor?: [number, number]) => {
  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize,
    iconAnchor: iconAnchor || [iconSize[0] / 2, iconSize[1] / 2],
    popupAnchor: [0, -iconSize[1] / 2],
  });
};

// Terminal/Start stop icon (larger, with label)
const createTerminalIcon = (name: string, isStart: boolean) => {
  const color = isStart ? '#059669' : '#dc2626';
  const label = isStart ? 'START' : 'END';
  return createIcon(`
    <div style="position:relative;">
      <div style="
        width:36px;height:36px;
        background:${color};
        border:3px solid white;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 3px 10px rgba(0,0,0,0.3);
        position:relative;
      ">
        <div style="
          width:16px;height:16px;
          background:white;
          border-radius:50%;
        "></div>
      </div>
      <div style="
        position:absolute;top:-8px;left:50%;transform:translateX(-50%);
        background:${color};color:white;
        font-size:9px;font-weight:bold;
        padding:1px 6px;border-radius:3px;
        white-space:nowrap;
      ">${label}</div>
    </div>
  `, [36, 44], [18, 44]);
};

// Major stop icon
const createMajorStopIcon = (sequence: number) => {
  return createIcon(`
    <div style="
      width:20px;height:20px;
      background:#10b981;
      border:2px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">
      <div style="
        width:8px;height:8px;
        background:white;
        border-radius:50%;
      "></div>
    </div>
  `, [20, 20]);
};

// Regular stop icon
const createStopIcon = (sequence: number, isSelected: boolean) => {
  const size = isSelected ? 14 : 10;
  const border = isSelected ? '3px solid #059669' : '2px solid white';
  return createIcon(`
    <div style="
      width:${size}px;height:${size}px;
      background:${isSelected ? '#059669' : '#34d399'};
      border:${border};
      border-radius:50%;
      box-shadow:0 1px 4px rgba(0,0,0,0.2);
      ${isSelected ? 'animation:pulse 1s infinite;' : ''}
    "></div>
  `, [size, size]);
};

// Bus icon with rotation
const createBusIcon = (busType: string, heading: number) => {
  const colors: Record<string, string> = {
    STANDARD: '#f59e0b',
    AC: '#0ea5e9',
    ELECTRIC: '#22c55e',
    MINI: '#a855f7',
  };
  const color = colors[busType] || colors.STANDARD;
  
  return createIcon(`
    <div style="
      width:36px;height:36px;
      background:${color};
      border:2px solid white;
      border-radius:8px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 12px rgba(0,0,0,0.35);
      transform:rotate(${heading}deg);
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
        <path d="M8 6v6m8-6v6M4 9h16M6 21h12a2 2 0 0 0 2-2v-4H4v4a2 2 0 0 0 2 2z"/>
        <circle cx="7" cy="18" r="1.5" fill="white"/>
        <circle cx="17" cy="18" r="1.5" fill="white"/>
      </svg>
    </div>
  `, [36, 36]);
};

// Traffic zone icon
const createTrafficIcon = (severity: string) => {
  const colors: Record<string, string> = {
    LOW: '#fbbf24',
    MODERATE: '#f97316',
    HIGH: '#ef4444',
    SEVERE: '#dc2626',
  };
  const color = colors[severity] || colors.MODERATE;
  
  return createIcon(`
    <div style="
      width:32px;height:32px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 12px rgba(0,0,0,0.35);
      animation:pulse 2s infinite;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </div>
  `, [32, 32]);
};

// Number marker for stops
const createNumberIcon = (number: number, isMajor: boolean, isTerminal: boolean) => {
  if (isTerminal) {
    return createIcon(`
      <div style="
        width:28px;height:28px;
        background:${number === 1 ? '#059669' : '#dc2626'};
        border:2px solid white;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-weight:bold;color:white;font-size:12px;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
      ">${number}</div>
    `, [28, 28]);
  }
  if (isMajor) {
    return createIcon(`
      <div style="
        width:22px;height:22px;
        background:#10b981;
        border:2px solid white;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-weight:bold;color:white;font-size:10px;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
      ">${number}</div>
    `, [22, 22]);
  }
  return createIcon(`
    <div style="
      width:16px;height:16px;
      background:#34d399;
      border:1.5px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:600;color:white;font-size:8px;
      box-shadow:0 1px 4px rgba(0,0,0,0.2);
    ">${number}</div>
  `, [16, 16]);
};

// Component to fit map bounds
function FitBounds({ route }: { route: BusRoute | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (route && route.stops.length > 0) {
      const bounds = L.latLngBounds(route.stops.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [route, map]);
  
  return null;
}

// Route line with direction arrows
function RouteLine({ positions, color }: { positions: [number, number][]; color: string }) {
  const groupRef = useRef<L.FeatureGroup>(null);
  
  useEffect(() => {
    if (groupRef.current) {
      // Add direction arrows using decorator pattern
      const group = groupRef.current;
      // Clear existing decorators
      group.eachLayer((layer) => {
        if (layer instanceof L.Polyline) {
          // Add arrow symbols along the line
          const latlngs = layer.getLatLngs() as L.LatLng[];
          if (latlngs.length >= 2) {
            // Create arrow markers at intervals
            for (let i = 1; i < latlngs.length; i++) {
              const start = latlngs[i - 1];
              const end = latlngs[i];
              const mid = L.latLng(
                (start.lat + end.lat) / 2,
                (start.lng + end.lng) / 2
              );
              const angle = Math.atan2(end.lat - start.lat, end.lng - start.lng) * 180 / Math.PI;
              
              const arrowIcon = L.divIcon({
                html: `
                  <div style="
                    width:16px;height:16px;
                    transform:rotate(${angle + 90}deg);
                    color:${color};
                    font-size:16px;
                    text-shadow:0 1px 2px rgba(255,255,255,0.8);
                  ">➤</div>
                `,
                className: 'arrow-marker',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });
              
              L.marker(mid, { icon: arrowIcon, interactive: false }).addTo(group);
            }
          }
        }
      });
    }
  }, [positions, color]);

  return (
    <FeatureGroup ref={groupRef}>
      {/* Main route line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: color,
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      {/* White outline for better visibility */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: 'white',
          weight: 10,
          opacity: 0.4,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </FeatureGroup>
  );
}

interface BusMapProps {
  route: BusRoute | null;
  buses: Bus[];
  trafficZones: TrafficZone[];
  selectedStop: string | null;
  onStopSelect: (stopId: string) => void;
}

export function BusMap({ route, buses, trafficZones, selectedStop, onStopSelect }: BusMapProps) {
  // Guwahati center coordinates
  const GUWAHATI_CENTER: [number, number] = [26.1700, 91.7600];
  
  // Filter buses on this route
  const routeBuses = useMemo(() => {
    if (!route) return [];
    return buses.filter(b => b.routeId === route.id && b.liveLocation);
  }, [route, buses]);

  // Route polyline coordinates
  const routePath = useMemo(() => {
    if (!route) return [];
    return route.stops.map(s => [s.latitude, s.longitude] as [number, number]);
  }, [route]);

  // Determine route color based on route type
  const routeColor = useMemo(() => {
    if (!route) return '#10b981';
    if (route.routeName.toLowerCase().includes('airport')) return '#3b82f6';
    if (route.routeName.toLowerCase().includes('express')) return '#8b5cf6';
    if (route.distance >= 20) return '#f59e0b';
    return '#10b981';
  }, [route]);

  if (!route) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl flex items-center justify-center">
        <div className="text-center text-emerald-700 p-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BusIcon className="w-10 h-10" />
          </div>
          <p className="text-xl font-semibold mb-2">Select a Route</p>
          <p className="text-sm opacity-75 max-w-xs">Choose a bus route from the list to view it on the map with all stops and live bus positions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <MapContainer
        center={GUWAHATI_CENTER}
        zoom={13}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Fit bounds when route changes */}
        <FitBounds route={route} />
        
        {/* Route polyline with direction */}
        {routePath.length > 1 && (
          <>
            {/* Shadow/outline */}
            <Polyline
              positions={routePath}
              pathOptions={{
                color: 'white',
                weight: 12,
                opacity: 0.5,
              }}
            />
            {/* Main route line */}
            <Polyline
              positions={routePath}
              pathOptions={{
                color: routeColor,
                weight: 5,
                opacity: 0.95,
                dashArray: null,
              }}
            />
            {/* Animated dashed overlay for direction */}
            <Polyline
              positions={routePath}
              pathOptions={{
                color: 'white',
                weight: 5,
                opacity: 0.6,
                dashArray: '10, 20',
                dashOffset: '0',
                className: 'animated-dash',
              }}
            />
          </>
        )}
        
        {/* Traffic zones */}
        {trafficZones.map((zone) => (
          <div key={zone.id}>
            {/* Zone circle */}
            <Circle
              center={[zone.latitude, zone.longitude]}
              radius={zone.radiusMeters}
              pathOptions={{
                color: zone.severity === 'SEVERE' ? '#dc2626' : 
                       zone.severity === 'HIGH' ? '#ef4444' : 
                       zone.severity === 'MODERATE' ? '#f97316' : '#fbbf24',
                fillColor: zone.severity === 'SEVERE' ? '#dc2626' : 
                           zone.severity === 'HIGH' ? '#ef4444' : 
                           zone.severity === 'MODERATE' ? '#f97316' : '#fbbf24',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '5, 5',
              }}
            />
            {/* Zone marker */}
            <Marker
              position={[zone.latitude, zone.longitude]}
              icon={createTrafficIcon(zone.severity)}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <div className="font-bold text-red-600 flex items-center gap-1 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {zone.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{zone.description}</div>
                  <div className="mt-2 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Severity:</span>
                      <span className={cn(
                        "font-bold",
                        zone.severity === 'SEVERE' && "text-red-600",
                        zone.severity === 'HIGH' && "text-orange-600",
                        zone.severity === 'MODERATE' && "text-amber-600",
                        zone.severity === 'LOW' && "text-yellow-600"
                      )}>
                        {zone.severity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Delay:</span>
                      <span className="font-bold text-red-600">+{zone.calculatedDelay} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reports:</span>
                      <span className="font-medium">{zone.reportCount}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
        
        {/* Bus stops with numbers */}
        {route.stops.map((stop, index) => {
          const isFirst = index === 0;
          const isLast = index === route.stops.length - 1;
          const isTerminal = isFirst || isLast;
          const isSelected = selectedStop === stop.id;
          
          return (
            <Marker
              key={stop.id}
              position={[stop.latitude, stop.longitude]}
              icon={createNumberIcon(index + 1, stop.isMajor, isTerminal)}
              eventHandlers={{
                click: () => onStopSelect(stop.id),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[160px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                      isFirst ? "bg-emerald-600" : isLast ? "bg-red-600" : "bg-emerald-500"
                    )}>
                      {index + 1}
                    </div>
                    <div className="font-bold text-emerald-700">{stop.name}</div>
                  </div>
                  {stop.landmark && (
                    <div className="text-xs text-gray-500 mb-2">Near: {stop.landmark}</div>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      Stop {index + 1} of {route.stops.length}
                    </Badge>
                    {stop.isMajor && (
                      <Badge className="text-[10px] bg-emerald-100 text-emerald-700">
                        Major Stop
                      </Badge>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Live bus positions */}
        {routeBuses.map((bus) => {
          if (!bus.liveLocation) return null;
          return (
            <Marker
              key={bus.id}
              position={[bus.liveLocation.latitude, bus.liveLocation.longitude]}
              icon={createBusIcon(bus.busType, bus.liveLocation.heading)}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-2 pb-2 border-b border-gray-100">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      bus.busType === 'AC' && "bg-sky-100",
                      bus.busType === 'ELECTRIC' && "bg-green-100",
                      bus.busType === 'STANDARD' && "bg-amber-100",
                      bus.busType === 'MINI' && "bg-purple-100"
                    )}>
                      {bus.busType === 'AC' ? (
                        <Snowflake className="w-5 h-5 text-sky-600" />
                      ) : bus.busType === 'ELECTRIC' ? (
                        <Zap className="w-5 h-5 text-green-600" />
                      ) : (
                        <BusIcon className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{bus.busNumber}</div>
                      <div className="text-xs text-gray-500">{bus.busType} Bus</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        Speed
                      </span>
                      <span className="font-bold text-emerald-600">{bus.liveLocation.speed} km/h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Next Stop</span>
                      <span className="font-medium">{bus.liveLocation.nextStopName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Stops Away</span>
                      <span className="font-medium">{bus.liveLocation.stopsAway}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400 text-center">
                    Updated: {new Date(bus.liveLocation.lastUpdated).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Route info badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-0 font-bold">
              {route.routeNumber}
            </Badge>
            <span className="font-semibold">{route.routeName}</span>
          </div>
        </div>
        <div className="px-4 py-2 text-xs text-gray-600 bg-white">
          <div className="flex items-center gap-4">
            <span>🚌 {route.distance} km</span>
            <span>🛑 {route.stops.length} stops</span>
            <span>💰 ₹{route.baseFare} min</span>
          </div>
        </div>
      </div>
      
      {/* Live indicator */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-lg">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-semibold text-gray-700">LIVE</span>
        <span className="text-xs text-gray-400">| {routeBuses.length} buses</span>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <Navigation className="w-3 h-3" />
          Route Legend
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">1</div>
            <span className="text-gray-600">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">N</div>
            <span className="text-gray-600">End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow" />
            <span className="text-gray-600">Major Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-300" />
            <span className="text-gray-600">Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-gray-600">Bus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-400 opacity-50" />
            <span className="text-gray-600">Traffic</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
            <span className="text-gray-600">Route Direction →</span>
          </div>
        </div>
      </div>
      
      {/* Direction arrow indicator */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="text-emerald-600 text-sm">→</span>
        </div>
        <span className="text-xs text-gray-600">
          {route.startPoint} → {route.endPoint}
        </span>
      </div>
    </div>
  );
}
