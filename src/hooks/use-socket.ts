'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { LiveBusLocation } from '@/components/astc/types';

interface BusPosition {
  busId: string;
  busNumber: string;
  busType: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  nextStopName: string;
  nextStopId: string | null;
  stopsAway: number;
  status: 'ON_TIME' | 'DELAYED' | 'ARRIVING';
  timestamp: string;
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
    nextStopId: pos.nextStopId,
  };
}

// Simple hook that provides fallback polling when WebSocket is unavailable
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [busPositions, setBusPositions] = useState<BusPosition[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const socketRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAttemptedSocketRef = useRef(false);

  // Fallback polling when socket fails
  const pollBusData = useCallback(async () => {
    try {
      const response = await fetch('/api/buses');
      const data = await response.json();
      if (data.success && data.data) {
        // Convert API bus data to BusPosition format
        const positions: BusPosition[] = data.data.map((bus: any) => ({
          busId: bus.id,
          busNumber: bus.busNumber,
          busType: bus.busType,
          routeId: bus.routeId,
          routeNumber: bus.route?.routeNumber || '',
          routeName: bus.route?.routeName || '',
          latitude: bus.liveLocation?.latitude || 26.17 + (Math.random() - 0.5) * 0.05,
          longitude: bus.liveLocation?.longitude || 91.76 + (Math.random() - 0.5) * 0.05,
          speed: bus.liveLocation?.speed || 20 + Math.random() * 20,
          heading: bus.liveLocation?.heading || Math.random() * 360,
          nextStopName: bus.liveLocation?.nextStopName || 'Unknown',
          nextStopId: bus.liveLocation?.nextStopId || null,
          stopsAway: bus.liveLocation?.stopsAway || Math.floor(Math.random() * 5) + 1,
          status: Math.random() > 0.8 ? 'DELAYED' : 'ON_TIME',
          timestamp: new Date().toISOString(),
        }));
        setBusPositions(positions);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.warn('Polling failed:', error);
    }
  }, []);

  useEffect(() => {
    // Try WebSocket first, but don't block
    const initSocket = async () => {
      if (hasAttemptedSocketRef.current) return;
      hasAttemptedSocketRef.current = true;

      try {
        const { io } = await import('socket.io-client');
        
        const socket = io({
          path: '/socket.io',
          transports: ['polling'],
          reconnection: false,
          timeout: 5000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          setIsConnected(true);
          // Stop polling if connected
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        });

        socket.on('bus-positions', (positions: BusPosition[]) => {
          setBusPositions(positions);
          setLastUpdate(new Date());
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
        });

        socket.on('connect_error', () => {
          socket.disconnect();
          socketRef.current = null;
        });

        socket.on('connect_timeout', () => {
          socket.disconnect();
          socketRef.current = null;
        });
      } catch (error) {
        console.warn('Socket initialization failed, using polling fallback');
      }
    };

    // Start polling immediately as fallback
    pollBusData();
    pollIntervalRef.current = setInterval(pollBusData, 10000);

    // Try socket after a small delay
    setTimeout(initSocket, 1000);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollBusData]);

  const subscribeToRoute = useCallback(() => {
    // No-op with polling fallback
  }, []);

  const unsubscribeFromRoute = useCallback(() => {
    // No-op with polling fallback
  }, []);

  return {
    isConnected,
    busPositions,
    trafficAlerts: [],
    subscribeToRoute,
    unsubscribeFromRoute,
    lastUpdate,
  };
}
