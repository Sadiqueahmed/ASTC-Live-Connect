'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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

export function useLiveBuses(routeId?: string) {
  const [positions, setPositions] = useState<BusPosition[]>([]);
  const [alerts, setAlerts] = useState<TrafficAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Subscribe to specific route if provided
      if (routeId) {
        socket.emit('subscribe-route', routeId);
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('bus-positions', (data: BusPosition[]) => {
      setPositions(data);
    });

    socket.on('traffic-alert', (alert: TrafficAlert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 10));
    });

    socket.on('connect_error', (error) => {
      console.log('WebSocket connection error:', error.message);
    });

    return () => {
      if (routeId) {
        socket.emit('unsubscribe-route', routeId);
      }
      socket.disconnect();
    };
  }, [routeId]);

  const subscribeToRoute = useCallback((newRouteId: string) => {
    if (socketRef.current) {
      // Unsubscribe from previous route if any
      if (routeId) {
        socketRef.current.emit('unsubscribe-route', routeId);
      }
      socketRef.current.emit('subscribe-route', newRouteId);
    }
  }, [routeId]);

  return {
    positions,
    alerts,
    isConnected,
    subscribeToRoute,
  };
}
