'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Bus, LiveBusLocation } from '@/components/astc/types';

interface BusPosition {
  busId: string;
  busNumber: string;
  routeId: string;
  routeNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  nextStopName: string;
  stopsAway: number;
  status: 'ON_TIME' | 'DELAYED' | 'ARRIVING';
  timestamp: string;
}

interface TrafficAlert {
  zone: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  delay: number;
  message: string;
  timestamp: string;
}

interface UseSocketReturn {
  isConnected: boolean;
  busPositions: BusPosition[];
  trafficAlerts: TrafficAlert[];
  subscribeToRoute: (routeId: string) => void;
  unsubscribeFromRoute: (routeId: string) => void;
  lastUpdate: Date | null;
}

// Convert socket bus position to LiveBusLocation format
export function convertToLiveLocation(pos: BusPosition): LiveBusLocation {
  return {
    busId: pos.busId,
    routeId: pos.routeId,
    latitude: pos.latitude,
    longitude: pos.longitude,
    speed: pos.speed,
    heading: pos.heading,
    lastUpdated: pos.timestamp,
    stopsAway: pos.stopsAway,
    nextStopName: pos.nextStopName,
  };
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [busPositions, setBusPositions] = useState<BusPosition[]>([]);
  const [trafficAlerts, setTrafficAlerts] = useState<TrafficAlert[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const subscribedRoutesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Initialize socket connection
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      
      // Re-subscribe to routes after reconnection
      subscribedRoutesRef.current.forEach(routeId => {
        socket.emit('subscribe-route', routeId);
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    socket.on('bus-positions', (positions: BusPosition[]) => {
      setBusPositions(positions);
      setLastUpdate(new Date());
    });

    socket.on('traffic-alert', (alert: TrafficAlert) => {
      setTrafficAlerts(prev => {
        // Keep only last 10 alerts, update if same zone
        const filtered = prev.filter(a => a.zone !== alert.zone);
        return [alert, ...filtered].slice(0, 10);
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const subscribeToRoute = useCallback((routeId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('subscribe-route', routeId);
      subscribedRoutesRef.current.add(routeId);
    }
  }, [isConnected]);

  const unsubscribeFromRoute = useCallback((routeId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('unsubscribe-route', routeId);
      subscribedRoutesRef.current.delete(routeId);
    }
  }, [isConnected]);

  return {
    isConnected,
    busPositions,
    trafficAlerts,
    subscribeToRoute,
    unsubscribeFromRoute,
    lastUpdate,
  };
}
