// Types for ASTC Live Connect

export interface BusStop {
  id: string;
  name: string;
  landmark: string | null;
  latitude: number;
  longitude: number;
  sequence: number;
  isMajor: boolean;
  routeId: string;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  baseFare: number;
  isActive: boolean;
  stops: BusStop[];
  buses: Bus[];
}

export interface Bus {
  id: string;
  busNumber: string;
  busType: 'STANDARD' | 'AC' | 'ELECTRIC' | 'MINI';
  capacity: number;
  routeId: string | null;
  isActive: boolean;
  route?: BusRoute;
  liveLocation?: LiveBusLocation;
}

export interface LiveBusLocation {
  busId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  lastUpdated: string;
  stopsAway: number;
  nextStopId?: string;
  nextStopName?: string;
  currentStopName?: string;
}

export interface TrafficZone {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  isActive: boolean;
  calculatedDelay: number;
  reportCount: number;
}

export interface CommunityReport {
  id: string;
  busId: string | null;
  reportType: 'DELAY' | 'BREAKDOWN' | 'ACCIDENT' | 'TRAFFIC_JAM' | 'ROAD_BLOCK' | 'WEATHER' | 'OTHER';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  delayMinutes: number;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  bus?: {
    busNumber: string;
    busType: string;
    route?: {
      routeNumber: string;
      routeName: string;
    };
  };
  trafficZone?: TrafficZone;
}

export interface ETAResult {
  busId: string;
  busNumber: string;
  busType: string;
  scheduledETA: number;
  realETA: number;
  stopsAway: number;
  status: 'ON_TIME' | 'DELAYED' | 'ARRIVING';
}

export interface ETADetail {
  busNumber: string;
  routeNumber: string;
  targetStop: string;
  distance: number;
  scheduledETA: number;
  realETA: number;
  delay: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  trafficImpact: {
    affected: boolean;
    zoneSeverity?: string;
    additionalMinutes?: number;
  };
  communityReports: {
    count: number;
    avgDelayMinutes: number;
  };
  lastUpdated: string;
}
