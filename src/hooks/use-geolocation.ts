'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BusStop } from '@/components/astc/types';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface NearestStop {
  stop: BusStop;
  distance: number;
  routeNumber?: string;
  routeName?: string;
}

interface UseGeolocationReturn {
  userLocation: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  nearestStops: NearestStop[];
  requestLocation: () => void;
  hasPermission: boolean | null;
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface StopWithRoute extends BusStop {
  routeNumber?: string;
  routeName?: string;
}

export function useGeolocation(stops: StopWithRoute[]): UseGeolocationReturn {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [nearestStops, setNearestStops] = useState<NearestStop[]>([]);
  
  // Use ref to store stops to avoid re-renders
  const stopsRef = useRef(stops);
  
  // Update ref when stops change
  useEffect(() => {
    stopsRef.current = stops;
  }, [stops]);

  // Calculate nearest stops when location changes
  useEffect(() => {
    if (!userLocation || stopsRef.current.length === 0) {
      if (nearestStops.length > 0) {
        setNearestStops([]);
      }
      return;
    }

    const stopsByDistance = stopsRef.current
      .map((stop) => ({
        stop,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          stop.latitude,
          stop.longitude
        ),
        routeNumber: stop.routeNumber,
        routeName: stop.routeName,
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Get top 5 nearest stops

    setNearestStops(stopsByDistance);
  }, [userLocation]); // Only depend on userLocation, use ref for stops

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        });
        setHasPermission(true);
        setIsLoading(false);
      },
      (err) => {
        let errorMessage = 'Failed to get your location';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable it in your browser settings.';
            setHasPermission(false);
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache for 1 minute
      }
    );
  }, []);

  // Watch position for continuous updates - only once on mount
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        });
        setHasPermission(true);
      },
      () => {
        // Silently fail for watch position
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 30000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return {
    userLocation,
    isLoading,
    error,
    nearestStops,
    requestLocation,
    hasPermission,
  };
}
