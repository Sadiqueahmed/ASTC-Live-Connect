import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const routes = await db.busRoute.findMany({
      where: { isActive: true },
      include: {
        stops: {
          orderBy: { sequence: 'asc' },
        },
        buses: {
          where: { isActive: true },
          select: {
            id: true,
            busNumber: true,
            busType: true,
          },
        },
      },
      orderBy: { routeNumber: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: routes,
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}
