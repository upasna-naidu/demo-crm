import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/leads');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;

    console.log('🔍 Fetching leads: page=%d, limit=%d, offset=%d', page, limit, offset);

    const leadsData = await query(
      `SELECT * FROM "Lead"
       ORDER BY "createdAt" DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countData = await query('SELECT COUNT(*)::int as total FROM "Lead"');

    console.log('✅ Found %d leads', leadsData.length);
    console.log('📊 Total:', countData[0]?.total);

    // Get stages and users for mapping
    const stages = await query('SELECT id, name FROM "Stage"');
    const users = await query('SELECT id, name FROM "User"');

    const stageMap = new Map(stages.map((s: any) => [s.id, s.name]));
    const userMap = new Map(users.map((u: any) => [u.id, u.name]));

    const leads = leadsData.map((l: any) => ({
      ...l,
      stage: { name: stageMap.get(l.stageId) || null },
      owner: { name: userMap.get(l.ownerId) || null },
    }));

    const total = countData[0]?.total || 0;

    return NextResponse.json({
      leads,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('❌ GET /api/leads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads', details: String(error) },
      { status: 500 }
    );
  }
}
