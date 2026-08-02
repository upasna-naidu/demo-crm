import { query, run } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: automationId } = await params;
    const { fromNodeId, toNodeId, label } = await request.json();

    const edgeId = uuidv4();

    await run(
      `INSERT INTO "AutomationEdge" (id, "automationId", "fromNodeId", "toNodeId", label) VALUES ($1, $2, $3, $4, $5)`,
      [edgeId, automationId, fromNodeId, toNodeId, label]
    );

    const edge = await query(
      `SELECT * FROM "AutomationEdge" WHERE id = $1`,
      [edgeId]
    );

    return Response.json({ edge: edge[0] }, { status: 201 });
  } catch (error) {
    console.error('[AutomationEdges API] Error:', error);
    return Response.json({ error: 'Failed to create edge' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { edgeId } = await request.json();

    await run(
      `DELETE FROM "AutomationEdge" WHERE id = $1`,
      [edgeId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('[AutomationEdges API] Error:', error);
    return Response.json({ error: 'Failed to delete edge' }, { status: 500 });
  }
}
