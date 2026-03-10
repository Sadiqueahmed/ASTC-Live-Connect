import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ReportType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const reportType = searchParams.get('type') as ReportType | null;

    const whereClause: { createdAt?: { gte: Date }; reportType?: ReportType } = {};
    
    // Only show reports from last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    whereClause.createdAt = { gte: yesterday };

    if (reportType && Object.values(ReportType).includes(reportType)) {
      whereClause.reportType = reportType;
    }

    const reports = await db.communityReport.findMany({
      where: whereClause,
      include: {
        bus: {
          select: {
            busNumber: true,
            busType: true,
            route: {
              select: {
                routeNumber: true,
                routeName: true,
              },
            },
          },
        },
        trafficZone: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { busId, reportType, title, description, latitude, longitude, delayMinutes, trafficZoneId } = body;

    if (!reportType || !title || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const report = await db.communityReport.create({
      data: {
        busId: busId || null,
        reportType: reportType as ReportType,
        title,
        description: description || '',
        latitude,
        longitude,
        delayMinutes: delayMinutes || 0,
        trafficZoneId: trafficZoneId || null,
        isVerified: false,
        helpfulCount: 0,
      },
      include: {
        bus: {
          select: {
            busNumber: true,
            route: {
              select: {
                routeNumber: true,
              },
            },
          },
        },
        trafficZone: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report submitted successfully. Thank you for contributing!',
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
