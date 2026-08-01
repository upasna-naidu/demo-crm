import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const stages = await query(
      `SELECT * FROM "PipelineStage" ORDER BY "displayOrder" ASC`,
      []
    );

    return NextResponse.json({
      success: true,
      stages: stages || []
    });
  } catch (error) {
    console.error('Failed to fetch pipeline stages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stages', details: String(error) },
      { status: 500 }
    );
  }
}
