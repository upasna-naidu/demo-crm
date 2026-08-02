import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: automationId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const executions = await query(
      `SELECT * FROM "AutomationExecution" WHERE "automationId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`,
      [automationId, limit, offset]
    );

    const withLogs = await Promise.all(
      executions.map(async (execution: any) => {
        const logs = await query(
          `SELECT * FROM "AutomationExecutionLog" WHERE "executionId" = $1 ORDER BY "executedAt"`,
          [execution.id]
        );
        return {
          ...execution,
          logs,
        };
      })
    );

    const total = await query(
      `SELECT COUNT(*) as count FROM "AutomationExecution" WHERE "automationId" = $1`,
      [automationId]
    );

    return Response.json({
      executions: withLogs,
      total: total[0]?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Automation Logs API] Error:', error);
    return Response.json({ executions: [], total: 0 });
  }
}
