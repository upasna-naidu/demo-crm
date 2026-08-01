import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Total leads count
    const leadCountRes = await query('SELECT COUNT(*) as cnt FROM "Lead"', []);
    const totalLeads = leadCountRes?.[0]?.cnt || 0;

    // Leads by status
    const byStatusRes = await query(
      'SELECT status, COUNT(*) as cnt FROM "Lead" GROUP BY status',
      []
    );
    const byStatus = byStatusRes || [];

    // Leads by stage
    const byStageRes = await query(
      'SELECT s.name, COUNT(l.id) as cnt FROM "Lead" l LEFT JOIN "PipelineStage" s ON l."stageId" = s.id GROUP BY l."stageId", s.name',
      []
    );
    const byStage = byStageRes || [];

    // Leads by owner
    const byOwnerRes = await query(
      'SELECT u.name, COUNT(l.id) as cnt FROM "Lead" l LEFT JOIN "User" u ON l."ownerId" = u.id GROUP BY l."ownerId", u.name',
      []
    );
    const byOwner = byOwnerRes || [];

    // Leads by source
    const bySourceRes = await query(
      'SELECT source, COUNT(*) as cnt FROM "Lead" WHERE source IS NOT NULL GROUP BY source',
      []
    );
    const bySource = bySourceRes || [];

    // Data quality metrics
    const qualityRes = await query(
      'SELECT AVG(score) as avgScore, COUNT(*) as checked FROM "LeadQualityMetric"',
      []
    );
    const avgQualityScore = qualityRes?.[0]?.avgScore || 0;
    const qualityChecked = qualityRes?.[0]?.checked || 0;

    // Duplicate detection
    const dupRes = await query(
      'SELECT COUNT(*) as cnt FROM "LeadQualityMetric" WHERE "isDuplicate" = 1',
      []
    );
    const duplicatesFound = dupRes?.[0]?.cnt || 0;

    // Leads needing attention (missing critical fields)
    const missingRes = await query(
      'SELECT COUNT(*) as cnt FROM "LeadQualityMetric" WHERE score < 70',
      []
    );
    const needsAttention = missingRes?.[0]?.cnt || 0;

    // Workflow executions
    const execRes = await query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as successful FROM "WorkflowExecution"',
      ['success']
    );
    const totalExecutions = execRes?.[0]?.total || 0;
    const successfulExecutions = execRes?.[0]?.successful || 0;

    // Leads without owner (unassigned)
    const unassignedRes = await query(
      'SELECT COUNT(*) as cnt FROM "Lead" WHERE "ownerId" IS NULL',
      []
    );
    const unassignedLeads = unassignedRes?.[0]?.cnt || 0;

    // Leads without stage
    const unstagedRes = await query(
      'SELECT COUNT(*) as cnt FROM "Lead" WHERE "stageId" IS NULL',
      []
    );
    const unstagedLeads = unstagedRes?.[0]?.cnt || 0;

    return NextResponse.json({
      success: true,
      summary: {
        totalLeads,
        unassignedLeads,
        unstagedLeads,
        qualityScore: Math.round(avgQualityScore),
        duplicatesFound,
        needsAttention
      },
      distribution: {
        byStatus: byStatus.map((s: any) => ({ name: s.status || 'unset', count: s.cnt })),
        byStage: byStage.map((s: any) => ({ name: s.name || 'unset', count: s.cnt })),
        byOwner: byOwner.map((o: any) => ({ name: o.name || 'unassigned', count: o.cnt })),
        bySource: bySource.map((s: any) => ({ name: s.source, count: s.cnt }))
      },
      quality: {
        averageScore: Math.round(avgQualityScore),
        recordsChecked: qualityChecked,
        duplicatesDetected: duplicatesFound,
        leadsNeedingAttention: needsAttention
      },
      automation: {
        totalExecutions,
        successfulExecutions,
        successRate: totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard', details: String(error) },
      { status: 500 }
    );
  }
}
