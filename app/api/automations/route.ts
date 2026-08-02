import { query, run } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const automations = await query(
      `SELECT * FROM "Automation" ORDER BY "createdAt" DESC`
    );

    const withExecutionCounts = await Promise.all(
      automations.map(async (auto: any) => {
        const counts = await query(
          `SELECT COUNT(*) as count FROM "AutomationExecution" WHERE "automationId" = $1`,
          [auto.id]
        );
        return {
          ...auto,
          executionCount: counts[0]?.count || 0,
        };
      })
    );

    return Response.json({ automations: withExecutionCounts });
  } catch (error) {
    console.error('[Automations API] Error:', error);
    return Response.json({ automations: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, companyId, createdBy } = await request.json();

    const id = uuidv4();
    await run(
      `INSERT INTO "Automation" (id, "companyId", name, description, "createdBy") VALUES ($1, $2, $3, $4, $5)`,
      [id, companyId, name, description, createdBy]
    );

    const automation = await query(
      `SELECT * FROM "Automation" WHERE id = $1`,
      [id]
    );

    return Response.json({ automation: automation[0] }, { status: 201 });
  } catch (error) {
    console.error('[Automations API] Error:', error);
    return Response.json({ error: 'Failed to create automation' }, { status: 500 });
  }
}
