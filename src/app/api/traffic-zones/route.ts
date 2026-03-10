import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const zones = await db.trafficZone.findMany({
      where: { isActive: true },
      include: {
        reports: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 6 * 60 * 60 * 1000), // Last 6 hours
            },
          },
          select: {
            id: true,
            reportType: true,
            delayMinutes: true,
            createdAt: true,
          },
          take: 5,
        },
      },
      orderBy: { severity: 'desc' },
    });

    // Calculate current severity based on recent reports
    const zonesWithCalculatedSeverity = zones.map((zone) => {
      const recentDelays = zone.reports.map((r) => r.delayMinutes);
      const avgDelay = recentDelays.length > 0
        ? recentDelays.reduce((a, b) => a + b, 0) / recentDelays.length
        : 0;

      return {
        ...zone,
        calculatedDelay: Math.round(avgDelay),
        reportCount: zone.reports.length,
      };
    });

    return NextResponse.json({
      success: true,
      data: zonesWithCalculatedSeverity,
    });
  } catch (error) {
    console.error('Error fetching traffic zones:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch traffic zones' },
      { status: 500 }
    );
  }
}
