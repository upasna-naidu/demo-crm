import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;

    // Get count
    const countRes = await query('SELECT COUNT(*) as cnt FROM "Lead"');
    const total = countRes?.[0]?.cnt || 0;

    // Get paginated leads
    const leads = await query(
      `SELECT * FROM "Lead" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get stages and users for mapping
    const stages = await query('SELECT id, name FROM "Stage"');
    const users = await query('SELECT id, name FROM "User"');

    const stageMap = new Map((stages || []).map((s: any) => [s.id, s.name]));
    const userMap = new Map((users || []).map((u: any) => [u.id, u.name]));

    // Map leads
    const mappedLeads = (leads || []).map((l: any) => ({
      ...l,
      stage: { id: l.stageId, name: stageMap.get(l.stageId) || null },
      owner: { id: l.ownerId, name: userMap.get(l.ownerId) || null },
    }));

    return NextResponse.json({
      leads: mappedLeads,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads', message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, title, source } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const leadId = `lead-${Date.now()}`;

    // Get next sequential lead number for display
    const countRes = await query('SELECT COUNT(*) as cnt FROM "Lead"', []);
    const count = countRes?.[0]?.cnt || 0;
    const displayLeadId = `L${String(count + 1).padStart(3, '0')}`;

    // Get default stage (Prospect)
    const stages = await query('SELECT id FROM "PipelineStage" WHERE name = ? LIMIT 1', ['Prospect']);
    const defaultStageId = stages?.[0]?.id || 'stage-prospect';

    await run(
      `INSERT INTO "Lead" (id, "leadId", name, email, phone, company, title, source, "stageId", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [leadId, displayLeadId, name, email, phone || null, company || null, title || null, source || 'manual', defaultStageId, 'new']
    );

    return NextResponse.json({
      success: true,
      leadId,
      displayLeadId,
      message: 'Lead created successfully'
    });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead', details: String(error) },
      { status: 500 }
    );
  }
}
