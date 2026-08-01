import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dealId } = await params;
    const body = await request.json();
    const { type, title, description, createdBy } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title' },
        { status: 400 }
      );
    }

    const activityId = `activity-${Date.now()}`;

    await run(
      `INSERT INTO "DealActivity" (id, "dealId", type, title, description, "activityDate", "createdBy")
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [activityId, dealId, type, title, description || null, new Date().toISOString(), createdBy || null]
    );

    return NextResponse.json({
      success: true,
      activityId: activityId,
      message: 'Activity added to deal'
    });
  } catch (error) {
    console.error('Failed to add deal activity:', error);
    return NextResponse.json(
      { error: 'Failed to add activity', details: String(error) },
      { status: 500 }
    );
  }
}
