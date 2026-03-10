import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TrafficSeverity } from '@prisma/client';

// Calculate distance between two points using Haversine formula
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

// Check if a point is within a traffic zone
function isInTrafficZone(
  lat: number,
  lon: number,
  zones: { latitude: number; longitude: number; radiusMeters: number; severity: TrafficSeverity }[]
): { affected: boolean; severity: TrafficSeverity | null; delayMinutes: number } {
  for (const zone of zones) {
    const distance = calculateDistance(lat, lon, zone.latitude, zone.longitude);
    const radiusKm = zone.radiusMeters / 1000;

    if (distance <= radiusKm) {
      // Calculate delay based on severity
      const delayMap: Record<TrafficSeverity, number> = {
        [TrafficSeverity.LOW]: 5,
        [TrafficSeverity.MODERATE]: 10,
        [TrafficSeverity.HIGH]: 20,
        [TrafficSeverity.SEVERE]: 35,
      };
      return {
        affected: true,
        severity: zone.severity,
        delayMinutes: delayMap[zone.severity],
      };
    }
  }
  return { affected: false, severity: null, delayMinutes: 0 };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { busId, targetStopId, currentLat, currentLon } = body;

    if (!busId || !targetStopId) {
      return NextResponse.json(
        { success: false, error: 'Missing busId or targetStopId' },
        { status: 400 }
      );
    }

    // Get bus and route information
    const bus = await db.bus.findUnique({
      where: { id: busId },
      include: {
        route: {
          include: {
            stops: {
              orderBy: { sequence: 'asc' },
            },
          },
        },
      },
    });

    if (!bus || !bus.route) {
      return NextResponse.json(
        { success: false, error: 'Bus or route not found' },
        { status: 404 }
      );
    }

    // Find target stop
    const targetStop = bus.route.stops.find((s) => s.id === targetStopId);
    if (!targetStop) {
      return NextResponse.json(
        { success: false, error: 'Target stop not found on this route' },
        { status: 404 }
      );
    }

    // Get current position (use provided or simulate)
    const busLat = currentLat || bus.route.stops[0].latitude;
    const busLon = currentLon || bus.route.stops[0].longitude;

    // Get active traffic zones
    const trafficZones = await db.trafficZone.findMany({
      where: { isActive: true },
    });

    // Calculate base distance and time
    const distance = calculateDistance(busLat, busLon, targetStop.latitude, targetStop.longitude);
    
    // Average bus speed in city traffic (25 km/h)
    const averageSpeed = 25;
    const baseTimeMinutes = (distance / averageSpeed) * 60;

    // Check for traffic zone impact
    const trafficImpact = isInTrafficZone(
      busLat,
      busLon,
      trafficZones.map((z) => ({
        latitude: z.latitude,
        longitude: z.longitude,
        radiusMeters: z.radiusMeters,
        severity: z.severity,
      }))
    );

    // Check for recent community reports on this route
    const recentReports = await db.communityReport.findMany({
      where: {
        bus: { routeId: bus.routeId },
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000), // Last 2 hours
        },
      },
    });

    const reportDelay = recentReports.reduce((sum, r) => sum + r.delayMinutes, 0);
    const avgReportDelay = recentReports.length > 0 ? reportDelay / recentReports.length : 0;

    // Calculate real ETA with all factors
    const realETA = Math.ceil(baseTimeMinutes + trafficImpact.delayMinutes + avgReportDelay);

    // Determine confidence level
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    if (trafficImpact.affected || recentReports.length > 2) {
      confidence = trafficImpact.severity === TrafficSeverity.SEVERE ? 'LOW' : 'MEDIUM';
    }

    return NextResponse.json({
      success: true,
      data: {
        busNumber: bus.busNumber,
        routeNumber: bus.route.routeNumber,
        targetStop: targetStop.name,
        distance: Math.round(distance * 10) / 10, // km with 1 decimal
        scheduledETA: Math.ceil(baseTimeMinutes),
        realETA,
        delay: Math.max(0, realETA - Math.ceil(baseTimeMinutes)),
        confidence,
        trafficImpact: trafficImpact.affected
          ? {
              affected: true,
              zoneSeverity: trafficImpact.severity,
              additionalMinutes: trafficImpact.delayMinutes,
            }
          : { affected: false },
        communityReports: {
          count: recentReports.length,
          avgDelayMinutes: Math.round(avgReportDelay),
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error calculating ETA:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate ETA' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const routeId = searchParams.get('routeId');
    const stopId = searchParams.get('stopId');

    if (!routeId || !stopId) {
      return NextResponse.json(
        { success: false, error: 'Missing routeId or stopId' },
        { status: 400 }
      );
    }

    // Get all active buses on this route
    const buses = await db.bus.findMany({
      where: {
        routeId,
        isActive: true,
      },
      include: {
        route: true,
      },
    });

    // Get the stop
    const stop = await db.busStop.findUnique({
      where: { id: stopId },
    });

    if (!stop) {
      return NextResponse.json(
        { success: false, error: 'Stop not found' },
        { status: 404 }
      );
    }

    // Calculate ETA for each bus
    const etas = buses.map((bus) => {
      // Simulate bus position along route
      const progress = Math.random();
      const routeStops = bus.route?.stops || [];
      const currentStopIndex = Math.floor(progress * (routeStops.length - 1));
      
      // Calculate distance to target stop
      const distance = calculateDistance(
        stop.latitude,
        stop.longitude,
        stop.latitude + (Math.random() - 0.5) * 0.02,
        stop.longitude + (Math.random() - 0.5) * 0.02
      );

      const baseTime = (distance / 25) * 60;
      const trafficDelay = Math.floor(Math.random() * 15);

      return {
        busId: bus.id,
        busNumber: bus.busNumber,
        busType: bus.busType,
        scheduledETA: Math.ceil(baseTime),
        realETA: Math.ceil(baseTime + trafficDelay),
        stopsAway: Math.floor(Math.random() * 5) + 1,
        status: trafficDelay > 10 ? 'DELAYED' : 'ON_TIME',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        stopName: stop.name,
        routeId,
        upcomingBuses: etas.sort((a, b) => a.realETA - b.realETA).slice(0, 3),
      },
    });
  } catch (error) {
    console.error('Error fetching ETAs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ETAs' },
      { status: 500 }
    );
  }
}
