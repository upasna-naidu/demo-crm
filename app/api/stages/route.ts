import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const stages = await query(
      `SELECT * FROM "Stage" ORDER BY "order" ASC`
    );

    return NextResponse.json(stages);
  } catch (error) {
    console.error('GET /api/stages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stages', details: String(error) },
      { status: 500 }
    );
  }
}
