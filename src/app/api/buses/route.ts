import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simulated live bus data - In production, this would come from ASTC's GPS system
function generateLiveLocation(busId: string, routeId: string) {
  // Get route stops to simulate realistic movement
  return {
    busId,
    routeId,
    latitude: 26.1500 + (Math.random() - 0.5) * 0.05,
    longitude: 91.7000 + (Math.random() - 0.5) * 0.05,
    speed: Math.floor(Math.random() * 40) + 10, // 10-50 km/h
    heading: Math.floor(Math.random() * 360),
    lastUpdated: new Date(),
    stopsAway: Math.floor(Math.random() * 5),
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const routeId = searchParams.get('routeId');

    const whereClause: { isActive: boolean; routeId?: string } = { isActive: true };
    if (routeId) {
      whereClause.routeId = routeId;
    }

    const buses = await db.bus.findMany({
      where: whereClause,
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

    // Add simulated live location data
    const busesWithLiveLocation = buses.map((bus) => {
      const liveData = generateLiveLocation(bus.id, bus.routeId || '');
      const currentStopIndex = Math.floor(Math.random() * (bus.route?.stops.length || 1));
      const nextStop = bus.route?.stops[currentStopIndex + 1] || bus.route?.stops[0];

      return {
        ...bus,
        liveLocation: {
          ...liveData,
          nextStopId: nextStop?.id,
          nextStopName: nextStop?.name,
          currentStopName: bus.route?.stops[currentStopIndex]?.name,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: busesWithLiveLocation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch buses' },
      { status: 500 }
    );
  }
}
