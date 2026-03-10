import { Server } from 'socket.io';

const PORT = 3003;

// Simulated bus data - in production, this would come from ASTC's GPS system
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

// Guwahati area coordinates
const GUWAHATI_CENTER = { lat: 26.1700, lon: 91.7600 };
const GUWAHATI_RADIUS = 0.08; // degrees

// Sample routes for simulation
const routes = [
  { id: 'route-1', number: '1A', stops: ['Adabari', 'Maligaon', 'Jalukbari', 'Panbazar', 'Paltan Bazaar'] },
  { id: 'route-2', number: '2B', stops: ['Paltan Bazaar', 'Ganeshguri', 'Six Mile', 'Khanapara'] },
  { id: 'route-3', number: '3C', stops: ['Adabari', 'Jalukbari', 'Paltan Bazaar', 'Ganeshguri', 'Six Mile'] },
];

// Generate random bus positions
function generateBusPositions(): BusPosition[] {
  const buses: BusPosition[] = [];
  
  // Generate 2-3 buses per route
  routes.forEach((route, routeIndex) => {
    const numBuses = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < numBuses; i++) {
      const busId = `bus-${routeIndex}-${i}`;
      const progress = Math.random();
      const currentStopIndex = Math.floor(progress * (route.stops.length - 1));
      
      buses.push({
        busId,
        busNumber: `AS-${1001 + routeIndex * 100 + i}`,
        routeId: route.id,
        routeNumber: route.number,
        latitude: GUWAHATI_CENTER.lat + (Math.random() - 0.5) * GUWAHATI_RADIUS * 2,
        longitude: GUWAHATI_CENTER.lon + (Math.random() - 0.5) * GUWAHATI_RADIUS * 2,
        speed: Math.floor(Math.random() * 35) + 5, // 5-40 km/h
        heading: Math.floor(Math.random() * 360),
        nextStopName: route.stops[currentStopIndex + 1] || route.stops[route.stops.length - 1],
        stopsAway: Math.floor(Math.random() * 4) + 1,
        status: Math.random() > 0.7 ? 'DELAYED' : 'ON_TIME',
        timestamp: new Date().toISOString(),
      });
    }
  });
  
  return buses;
}

// Simulate bus movement
function updateBusPosition(bus: BusPosition): BusPosition {
  // Small random movement
  const latDelta = (Math.random() - 0.5) * 0.002;
  const lonDelta = (Math.random() - 0.5) * 0.002;
  
  return {
    ...bus,
    latitude: Math.max(GUWAHATI_CENTER.lat - GUWAHATI_RADIUS, 
                       Math.min(GUWAHATI_CENTER.lat + GUWAHATI_RADIUS, 
                                bus.latitude + latDelta)),
    longitude: Math.max(GUWAHATI_CENTER.lon - GUWAHATI_RADIUS, 
                        Math.min(GUWAHATI_CENTER.lon + GUWAHATI_RADIUS, 
                                 bus.longitude + lonDelta)),
    speed: Math.max(0, Math.min(60, bus.speed + (Math.random() - 0.5) * 10)),
    heading: (bus.heading + (Math.random() - 0.5) * 20 + 360) % 360,
    stopsAway: Math.max(0, bus.stopsAway - (Math.random() > 0.9 ? 1 : 0)),
    timestamp: new Date().toISOString(),
  };
}

// Create Socket.IO server
const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

console.log(`🚌 ASTC Live Bus Service running on port ${PORT}`);

// Store current bus positions
let currentPositions = generateBusPositions();

// Handle connections
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Send initial data
  socket.emit('bus-positions', currentPositions);
  
  // Handle route subscription
  socket.on('subscribe-route', (routeId: string) => {
    socket.join(`route:${routeId}`);
    const routeBuses = currentPositions.filter(b => b.routeId === routeId);
    socket.emit('bus-positions', routeBuses);
  });
  
  // Handle route unsubscription
  socket.on('unsubscribe-route', (routeId: string) => {
    socket.leave(`route:${routeId}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Update positions every 5 seconds
setInterval(() => {
  currentPositions = currentPositions.map(updateBusPosition);
  
  // Broadcast to all clients
  io.emit('bus-positions', currentPositions);
  
  // Broadcast to route-specific rooms
  routes.forEach(route => {
    const routeBuses = currentPositions.filter(b => b.routeId === route.id);
    io.to(`route:${route.id}`).emit('bus-positions', routeBuses);
  });
}, 5000);

// Traffic alerts simulation
const trafficAlerts = [
  { zone: 'Maligaon Flyover', severity: 'SEVERE', delay: 25, message: 'Construction causing major delays' },
  { zone: 'Paltan Bazaar Junction', severity: 'HIGH', delay: 15, message: 'Peak hour congestion' },
  { zone: 'GS Road - Ganeshguri', severity: 'MODERATE', delay: 8, message: 'Moderate traffic flow' },
];

// Broadcast traffic alerts every 30 seconds
setInterval(() => {
  // Randomly update one alert
  const randomAlert = trafficAlerts[Math.floor(Math.random() * trafficAlerts.length)];
  randomAlert.delay = Math.floor(Math.random() * 20) + 5;
  randomAlert.severity = randomAlert.delay > 20 ? 'SEVERE' : randomAlert.delay > 10 ? 'HIGH' : 'MODERATE';
  
  io.emit('traffic-alert', {
    ...randomAlert,
    timestamp: new Date().toISOString(),
  });
}, 30000);
