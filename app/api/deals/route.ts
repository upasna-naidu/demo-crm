import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const stageId = searchParams.get('stageId');
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');

    let sql = `
      SELECT d.*, s.name as "stageName", s.probability
      FROM "Deal" d
      LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (leadId) {
      sql += ` AND d."leadId" = ?`;
      params.push(leadId);
    }
    if (stageId) {
      sql += ` AND d."stageId" = ?`;
      params.push(stageId);
    }
    if (ownerId) {
      sql += ` AND d."ownerId" = ?`;
      params.push(ownerId);
    }
    if (status) {
      sql += ` AND d.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY d."createdAt" DESC`;

    const deals = await query(sql, params);

    return NextResponse.json({
      success: true,
      deals: deals || []
    });
  } catch (error) {
    console.error('Failed to fetch deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, contactId, companyId, title, value, currency, stageId, ownerId, expectedCloseDate, description } = body;

    if (!leadId || !title || !value || !stageId) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, title, value, stageId' },
        { status: 400 }
      );
    }

    const dealId = `deal-${Date.now()}`;

    await run(
      `INSERT INTO "Deal" (id, "dealId", "leadId", "contactId", "companyId", title, description, value, currency, "stageId", "ownerId", "expectedCloseDate", status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dealId, dealId, leadId, contactId || null, companyId || null, title, description || null, value, currency || 'USD', stageId, ownerId || null, expectedCloseDate || null, 'open']
    );

    return NextResponse.json({
      success: true,
      dealId: dealId,
      message: 'Deal created successfully'
    });
  } catch (error) {
    console.error('Failed to create deal:', error);
    return NextResponse.json(
      { error: 'Failed to create deal', details: String(error) },
      { status: 500 }
    );
  }
}
