import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deal = await query(
      `SELECT d.*, s.name as "stageName", s.probability
       FROM "Deal" d
       LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
       WHERE d.id = ?`,
      [id]
    );

    if (!deal || deal.length === 0) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Fetch activities
    const activities = await query(
      `SELECT * FROM "DealActivity" WHERE "dealId" = ? ORDER BY "createdAt" DESC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      deal: deal[0],
      activities: activities || []
    });
  } catch (error) {
    console.error('Failed to fetch deal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stageId, value, ownerId, expectedCloseDate, status, description, title } = body;

    const updates = [];
    const vals: any[] = [];
    let paramCount = 1;

    if (stageId !== undefined) {
      updates.push(`"stageId" = ?`);
      vals.push(stageId);
    }
    if (value !== undefined) {
      updates.push(`value = ?`);
      vals.push(value);
    }
    if (ownerId !== undefined) {
      updates.push(`"ownerId" = ?`);
      vals.push(ownerId);
    }
    if (expectedCloseDate !== undefined) {
      updates.push(`"expectedCloseDate" = ?`);
      vals.push(expectedCloseDate);
    }
    if (status !== undefined) {
      updates.push(`status = ?`);
      vals.push(status);
    }
    if (description !== undefined) {
      updates.push(`description = ?`);
      vals.push(description);
    }
    if (title !== undefined) {
      updates.push(`title = ?`);
      vals.push(title);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    vals.push(id);

    await run(
      `UPDATE "Deal" SET ${updates.join(', ')} WHERE id = ?`,
      vals
    );

    return NextResponse.json({ success: true, message: 'Deal updated' });
  } catch (error) {
    console.error('Failed to update deal:', error);
    return NextResponse.json(
      { error: 'Failed to update deal', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete activities first
    await run(`DELETE FROM "DealActivity" WHERE "dealId" = ?`, [id]);

    // Delete deal
    await run(`DELETE FROM "Deal" WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Deal deleted' });
  } catch (error) {
    console.error('Failed to delete deal:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal', details: String(error) },
      { status: 500 }
    );
  }
}
