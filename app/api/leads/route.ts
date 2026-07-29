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

    const [leadsData, countData] = await Promise.all([
      query(
        `SELECT l.*, s.name as "stageName", u.name as "ownerName"
         FROM "Lead" l
         LEFT JOIN "Stage" s ON l."stageId" = s.id
         LEFT JOIN "User" u ON l."ownerId" = u.id
         ORDER BY l."createdAt" DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      query('SELECT COUNT(*)::int as total FROM "Lead"'),
    ]);

    console.log('✅ Found %d leads', leadsData.length);
    console.log('📊 Count data:', countData);

    const leads = leadsData.map((l: any) => ({
      ...l,
      stage: { name: l.stageName },
      owner: { name: l.ownerName },
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
