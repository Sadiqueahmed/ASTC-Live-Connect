import { Server } from 'socket.io';

const PORT = 3003;

// Real bus position from database
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

interface TrafficAlert {
  zoneId: string;
  zone: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  delay: number;
  message: string;
  timestamp: string;
}

interface RouteData {
  id: string;
  routeNumber: string;
  routeName: string;
  stops: { id: string; name: string; latitude: number; longitude: number; sequence: number }[];
}

interface BusData {
  id: string;
  busNumber: string;
  busType: string;
  routeId: string | null;
  route: RouteData | null;
}

// Cache for route and bus data
let routesCache: RouteData[] = [];
let busesCache: BusData[] = [];
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // 1 minute

// Fetch data from main app API
async function fetchRoutesAndBuses() {
  const now = Date.now();
  if (now - lastCacheUpdate < CACHE_TTL && routesCache.length > 0) {
    return { routes: routesCache, buses: busesCache };
  }

  try {
    // Fetch from main app API
    const [routesRes, busesRes] = await Promise.all([
      fetch('http://localhost:3000/api/routes'),
      fetch('http://localhost:3000/api/buses')
    ]);

    const routesData = await routesRes.json();
    const busesData = await busesRes.json();

    if (routesData.success && busesData.success) {
      routesCache = routesData.data.map((r: any) => ({
        id: r.id,
        routeNumber: r.routeNumber,
        routeName: r.routeName,
        stops: r.stops || []
      }));
      
      busesCache = busesData.data.map((b: any) => ({
        id: b.id,
        busNumber: b.busNumber,
        busType: b.busType,
        routeId: b.routeId,
        route: b.route ? {
          id: b.route.id,
          routeNumber: b.route.routeNumber,
          routeName: b.route.routeName,
          stops: b.route.stops || []
        } : null
      }));
      
      lastCacheUpdate = now;
    }
  } catch (error) {
    console.error('Error fetching data from main app:', error);
  }

  return { routes: routesCache, buses: busesCache };
}

// Store current bus positions for simulation
let currentPositions: Map<string, {
  progress: number;
  direction: 1 | -1;
  speed: number;
  heading: number;
}> = new Map();

// Generate simulated bus positions based on real route data
async function generateBusPositions(): Promise<BusPosition[]> {
  const { buses } = await fetchRoutesAndBuses();
  const positions: BusPosition[] = [];

  for (const bus of buses) {
    if (!bus.route || !bus.route.stops || bus.route.stops.length < 2) continue;

    const routeStops = bus.route.stops;
    
    // Initialize position tracking if not exists
    if (!currentPositions.has(bus.id)) {
      currentPositions.set(bus.id, {
        progress: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: 15 + Math.random() * 20, // 15-35 km/h
        heading: Math.random() * 360,
      });
    }

    const pos = currentPositions.get(bus.id)!;
    
    // Update progress along route
    pos.progress += (pos.direction * 0.02); // Move 2% each update
    if (pos.progress >= 1) {
      pos.progress = 0.99;
      pos.direction = -1;
    } else if (pos.progress <= 0) {
      pos.progress = 0.01;
      pos.direction = 1;
    }

    // Calculate current position based on route stops
    const totalStops = routeStops.length;
    const currentStopIndex = Math.floor(pos.progress * (totalStops - 1));
    const nextStopIndex = Math.min(currentStopIndex + 1, totalStops - 1);
    
    const currentStop = routeStops[currentStopIndex];
    const nextStop = routeStops[nextStopIndex];
    
    // Interpolate position between stops
    const segmentProgress = (pos.progress * (totalStops - 1)) % 1;
    const latitude = currentStop.latitude + (nextStop.latitude - currentStop.latitude) * segmentProgress;
    const longitude = currentStop.longitude + (nextStop.longitude - currentStop.longitude) * segmentProgress;
    
    // Calculate heading based on direction
    const latDiff = nextStop.latitude - currentStop.latitude;
    const lonDiff = nextStop.longitude - currentStop.longitude;
    pos.heading = (Math.atan2(latDiff, lonDiff) * 180 / Math.PI + 360) % 360;
    
    // Random speed variation
    pos.speed = Math.max(5, Math.min(50, pos.speed + (Math.random() - 0.5) * 5));

    // Determine status based on random factor
    const statusRandom = Math.random();
    let status: 'ON_TIME' | 'DELAYED' | 'ARRIVING' = 'ON_TIME';
    if (statusRandom > 0.85) {
      status = 'DELAYED';
    } else if (pos.progress > 0.95 || nextStopIndex === totalStops - 1) {
      status = 'ARRIVING';
    }

    positions.push({
      busId: bus.id,
      busNumber: bus.busNumber,
      busType: bus.busType,
      routeId: bus.route.id,
      routeNumber: bus.route.routeNumber,
      routeName: bus.route.routeName,
      latitude,
      longitude,
      speed: Math.round(pos.speed),
      heading: Math.round(pos.heading),
      nextStopName: nextStop.name,
      nextStopId: nextStop.id,
      stopsAway: nextStopIndex - currentStopIndex,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  return positions;
}

// Generate traffic alerts (simplified - using static data for now)
async function generateTrafficAlerts(): Promise<TrafficAlert[]> {
  // These could be fetched from the main app's traffic zones API
  const staticAlerts = [
    { zoneId: 'zone-1', zone: 'Maligaon Flyover', severity: 'SEVERE' as const, delay: 25, message: 'Construction causing major delays' },
    { zoneId: 'zone-2', zone: 'Paltan Bazaar Junction', severity: 'HIGH' as const, delay: 15, message: 'Peak hour congestion' },
    { zoneId: 'zone-3', zone: 'GS Road - Ganeshguri', severity: 'MODERATE' as const, delay: 8, message: 'Moderate traffic flow' },
    { zoneId: 'zone-4', zone: 'Fancy Bazaar', severity: 'LOW' as const, delay: 5, message: 'Light traffic' },
    { zoneId: 'zone-5', zone: 'Ulubari Chariali', severity: 'MODERATE' as const, delay: 10, message: 'Rush hour traffic' },
  ];

  // Randomly vary delays
  return staticAlerts.map(alert => ({
    ...alert,
    delay: alert.delay + Math.floor(Math.random() * 10) - 5,
    timestamp: new Date().toISOString(),
  }));
}

// Create Socket.IO server
const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

console.log(`🚌 ASTC Live Bus Service running on port ${PORT}`);

// Handle connections
io.on('connection', async (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  try {
    // Send initial bus positions
    const initialPositions = await generateBusPositions();
    socket.emit('bus-positions', initialPositions);
    
    // Send initial traffic alerts
    const initialAlerts = await generateTrafficAlerts();
    socket.emit('traffic-alerts', initialAlerts);
  } catch (error) {
    console.error('Error sending initial data:', error);
  }
  
  // Handle route subscription
  socket.on('subscribe-route', async (routeId: string) => {
    socket.join(`route:${routeId}`);
    console.log(`Client ${socket.id} subscribed to route ${routeId}`);
    
    try {
      const positions = await generateBusPositions();
      const routeBuses = positions.filter(b => b.routeId === routeId);
      socket.emit('bus-positions', routeBuses);
    } catch (error) {
      console.error('Error sending route buses:', error);
    }
  });
  
  // Handle route unsubscription
  socket.on('unsubscribe-route', (routeId: string) => {
    socket.leave(`route:${routeId}`);
    console.log(`Client ${socket.id} unsubscribed from route ${routeId}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Update and broadcast positions every 5 seconds
setInterval(async () => {
  try {
    const positions = await generateBusPositions();
    
    // Broadcast to all clients
    io.emit('bus-positions', positions);
    
    // Broadcast to route-specific rooms
    const routeIds = [...new Set(positions.map(p => p.routeId))];
    for (const routeId of routeIds) {
      const routeBuses = positions.filter(b => b.routeId === routeId);
      io.to(`route:${routeId}`).emit('bus-positions', routeBuses);
    }
  } catch (error) {
    console.error('Error updating positions:', error);
  }
}, 5000);

// Broadcast traffic alerts every 30 seconds
setInterval(async () => {
  try {
    const alerts = await generateTrafficAlerts();
    io.emit('traffic-alerts', alerts);
    
    // Also emit individual alerts
    for (const alert of alerts) {
      io.emit('traffic-alert', alert);
    }
  } catch (error) {
    console.error('Error updating traffic alerts:', error);
  }
}, 30000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  io.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  io.close();
  process.exit(0);
});
