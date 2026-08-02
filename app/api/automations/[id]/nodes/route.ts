import { query, run } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: automationId } = await params;
    const { type, label, position, config } = await request.json();

    const nodeId = uuidv4();

    await run(
      `INSERT INTO "AutomationNode" (id, "automationId", type, label, position, config) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        nodeId,
        automationId,
        type,
        label,
        JSON.stringify(position),
        JSON.stringify(config),
      ]
    );

    const node = await query(
      `SELECT * FROM "AutomationNode" WHERE id = $1`,
      [nodeId]
    );

    return Response.json({ node: node[0] }, { status: 201 });
  } catch (error) {
    console.error('[AutomationNodes API] Error:', error);
    return Response.json({ error: 'Failed to create node' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { nodeId, label, position, config } = await request.json();

    await run(
      `UPDATE "AutomationNode" SET label = $1, position = $2, config = $3 WHERE id = $4`,
      [
        label,
        JSON.stringify(position),
        JSON.stringify(config),
        nodeId,
      ]
    );

    const node = await query(
      `SELECT * FROM "AutomationNode" WHERE id = $1`,
      [nodeId]
    );

    return Response.json({ node: node[0] });
  } catch (error) {
    console.error('[AutomationNodes API] Error:', error);
    return Response.json({ error: 'Failed to update node' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { nodeId } = await request.json();

    await run(
      `DELETE FROM "AutomationEdge" WHERE "fromNodeId" = $1 OR "toNodeId" = $1`,
      [nodeId]
    );

    await run(
      `DELETE FROM "AutomationNode" WHERE id = $1`,
      [nodeId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('[AutomationNodes API] Error:', error);
    return Response.json({ error: 'Failed to delete node' }, { status: 500 });
  }
}
