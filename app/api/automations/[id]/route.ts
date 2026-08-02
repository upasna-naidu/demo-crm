import { query, run } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const automation = await query(
      `SELECT * FROM "Automation" WHERE id = $1`,
      [id]
    );

    if (!automation.length) {
      return Response.json({ error: 'Automation not found' }, { status: 404 });
    }

    const nodes = await query(
      `SELECT * FROM "AutomationNode" WHERE "automationId" = $1 ORDER BY "createdAt"`,
      [id]
    );

    const edges = await query(
      `SELECT * FROM "AutomationEdge" WHERE "automationId" = $1`,
      [id]
    );

    return Response.json({
      automation: automation[0],
      nodes,
      edges,
    });
  } catch (error) {
    console.error('[Automation GET] Error:', error);
    return Response.json({ error: 'Failed to fetch automation' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, enabled } = await request.json();

    await run(
      `UPDATE "Automation" SET name = $1, description = $2, enabled = $3, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $4`,
      [name, description, enabled ? 1 : 0, id]
    );

    const automation = await query(
      `SELECT * FROM "Automation" WHERE id = $1`,
      [id]
    );

    return Response.json({ automation: automation[0] });
  } catch (error) {
    console.error('[Automation PUT] Error:', error);
    return Response.json({ error: 'Failed to update automation' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await run(`DELETE FROM "AutomationExecutionLog" WHERE "executionId" IN (SELECT id FROM "AutomationExecution" WHERE "automationId" = $1)`, [id]);
    await run(`DELETE FROM "AutomationExecution" WHERE "automationId" = $1`, [id]);
    await run(`DELETE FROM "AutomationEdge" WHERE "automationId" = $1`, [id]);
    await run(`DELETE FROM "AutomationNode" WHERE "automationId" = $1`, [id]);
    await run(`DELETE FROM "Automation" WHERE id = $1`, [id]);

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Automation DELETE] Error:', error);
    return Response.json({ error: 'Failed to delete automation' }, { status: 500 });
  }
}
