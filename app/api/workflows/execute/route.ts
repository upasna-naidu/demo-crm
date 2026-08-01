import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { leadId, ruleId } = await request.json();

    if (!leadId || !ruleId) {
      return NextResponse.json(
        { error: 'Missing leadId or ruleId' },
        { status: 400 }
      );
    }

    // Get the rule
    const ruleRes = await query('SELECT * FROM "WorkflowRule" WHERE id = ?', [ruleId]);
    const rule = ruleRes?.[0];

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    if (!rule.enabled) {
      return NextResponse.json({ success: false, message: 'Rule is disabled' });
    }

    let result: Record<string, any> = { status: 'completed', action: rule.actionType };

    // Execute based on action type
    if (rule.actionType === 'assign_round_robin') {
      // Get users and assign in round-robin
      const users = await query('SELECT id FROM "User"', []);
      if (users && users.length > 0) {
        // Simple round-robin: assign to user with least leads
        const userLeadCounts = await query(
          `SELECT "ownerId", COUNT(*) as cnt FROM "Lead" WHERE "ownerId" IS NOT NULL GROUP BY "ownerId"`,
          []
        );

        let assignUser = users[0].id;
        let minCount = Infinity;

        for (const user of users) {
          const count = userLeadCounts.find((u: any) => u.ownerId === user.id)?.cnt || 0;
          if (count < minCount) {
            minCount = count;
            assignUser = user.id;
          }
        }

        await run('UPDATE "Lead" SET "ownerId" = ? WHERE id = ?', [assignUser, leadId]);
        result.assigned_to = assignUser;
      }
    } else if (rule.actionType === 'detect_duplicates') {
      // Check for duplicate emails
      const lead = await query('SELECT email FROM "Lead" WHERE id = ?', [leadId]);
      if (lead && lead.length > 0) {
        const duplicates = await query(
          'SELECT id FROM "Lead" WHERE email = ? AND id != ?',
          [lead[0].email, leadId]
        );

        if (duplicates && duplicates.length > 0) {
          const dupId = duplicates[0].id;
          await run(
            'INSERT INTO "LeadQualityMetric" (id, "leadId", "isDuplicate", "duplicateLeadId") VALUES (?, ?, ?, ?)',
            [`metric-${Date.now()}`, leadId, 1, dupId]
          );
          result.duplicate_detected = true;
          result.duplicate_lead = dupId;
        }
      }
    } else if (rule.actionType === 'validate_data') {
      // Calculate data quality score
      const lead = await query('SELECT * FROM "Lead" WHERE id = ?', [leadId]);
      if (lead && lead.length > 0) {
        const l = lead[0];
        let score = 0;
        const missingFields = [];

        if (l.name) score += 20; else missingFields.push('name');
        if (l.email) score += 20; else missingFields.push('email');
        if (l.phone) score += 15; else missingFields.push('phone');
        if (l.company) score += 15; else missingFields.push('company');
        if (l.stageId) score += 15; else missingFields.push('stage');
        if (l.ownerId) score += 15; else missingFields.push('owner');

        await run(
          'INSERT INTO "LeadQualityMetric" (id, "leadId", score, "missingFields", "completeness") VALUES (?, ?, ?, ?, ?)',
          [`metric-${Date.now()}`, leadId, score, JSON.stringify(missingFields), score]
        );
        result.quality_score = score;
        result.missing_fields = missingFields;
      }
    }

    // Log execution
    await run(
      'INSERT INTO "WorkflowExecution" (id, "ruleId", "leadId", status, result) VALUES (?, ?, ?, ?, ?)',
      [`exec-${Date.now()}`, ruleId, leadId, 'success', JSON.stringify(result)]
    );

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute workflow', details: String(error) },
      { status: 500 }
    );
  }
}
