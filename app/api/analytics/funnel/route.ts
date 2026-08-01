import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Define funnel stages
    const stages = [
      { id: 'awareness', name: 'Awareness', description: 'Leads discovered' },
      { id: 'consideration', name: 'Consideration', description: 'Leads evaluated' },
      { id: 'decision', name: 'Decision', description: 'Leads moving to deals' },
      { id: 'customer', name: 'Customer', description: 'Won deals' },
    ];

    // Get lead counts by stage
    const leadsByStageRes = await query(
      `SELECT
        s.id,
        s.name,
        COUNT(l.id) as count,
        AVG(CAST((julianday('now') - julianday(l."createdAt")) AS INTEGER)) as avgAgeDays
      FROM "PipelineStage" s
      LEFT JOIN "Lead" l ON l."stageId" = s.id
      GROUP BY s.id, s.name
      ORDER BY s.id ASC`,
      []
    );

    // Get conversion metrics
    const totalLeads = await query('SELECT COUNT(*) as cnt FROM "Lead"', []);
    const leadsWithDeals = await query(
      'SELECT COUNT(DISTINCT "leadId") as cnt FROM "Deal"',
      []
    );
    const wonDeals = await query(
      'SELECT COUNT(*) as cnt FROM "Deal" WHERE status = ?',
      ['won']
    );

    const total = totalLeads?.[0]?.cnt || 0;
    const withDeals = leadsWithDeals?.[0]?.cnt || 0;
    const won = wonDeals?.[0]?.cnt || 0;

    const conversionRates = {
      leadsToOpportunity: total > 0 ? Math.round((withDeals / total) * 100) : 0,
      opportunityToCustomer: withDeals > 0 ? Math.round((won / withDeals) * 100) : 0,
      totalConversion: total > 0 ? Math.round((won / total) * 100) : 0,
    };

    // Calculate funnel data
    const funnelData = [
      {
        stage: 'Awareness',
        count: total,
        percentage: 100,
        description: 'Total leads in system',
      },
      {
        stage: 'Consideration',
        count: withDeals,
        percentage: total > 0 ? Math.round((withDeals / total) * 100) : 0,
        description: 'Leads with open opportunities',
      },
      {
        stage: 'Customer',
        count: won,
        percentage: total > 0 ? Math.round((won / total) * 100) : 0,
        description: 'Closed won deals',
      },
    ];

    // Get lead source conversion
    const sourceConversionRes = await query(
      `SELECT
        l.source,
        COUNT(DISTINCT l.id) as leadCount,
        COUNT(DISTINCT d.id) as dealCount,
        SUM(CASE WHEN d.status = ? THEN 1 ELSE 0 END) as wonCount,
        AVG(d.value) as avgDealValue
      FROM "Lead" l
      LEFT JOIN "Deal" d ON l.id = d."leadId"
      WHERE l.source IS NOT NULL
      GROUP BY l.source
      ORDER BY leadCount DESC`,
      ['won']
    );

    const sourceConversion = (sourceConversionRes || []).map((s: any) => ({
      source: s.source,
      leads: s.leadCount,
      deals: s.dealCount || 0,
      won: s.wonCount || 0,
      conversionToDeal: s.leadCount > 0 ? Math.round((s.dealCount || 0 / s.leadCount) * 100) : 0,
      avgDealValue: Math.round(s.avgDealValue || 0),
    }));

    // Get lead velocity (time to conversion)
    const velocityRes = await query(
      `SELECT
        AVG(CAST((julianday(d."createdAt") - julianday(l."createdAt")) AS INTEGER)) as daysToConversion,
        COUNT(*) as convertedCount
      FROM "Lead" l
      JOIN "Deal" d ON l.id = d."leadId"
      WHERE d.status = ?`,
      ['won']
    );

    const velocity = velocityRes?.[0] || { daysToConversion: 0, convertedCount: 0 };

    // Get customer acquisition cost (by lead source)
    const acquiredLeads = await query(
      `SELECT
        l.source,
        COUNT(*) as count,
        SUM(CASE WHEN d.id IS NOT NULL THEN 1 ELSE 0 END) as customers
      FROM "Lead" l
      LEFT JOIN "Deal" d ON l.id = d."leadId" AND d.status = ?
      GROUP BY l.source`,
      ['won']
    );

    // Churn/Retention (based on lead status changes)
    const statusDistribution = await query(
      `SELECT
        status,
        COUNT(*) as count
      FROM "Lead"
      GROUP BY status`,
      []
    );

    return NextResponse.json({
      success: true,
      funnelData,
      conversionRates,
      sourceConversion,
      velocity: {
        avgDaysToConversion: Math.round(velocity.daysToConversion || 0),
        convertedCount: velocity.convertedCount || 0,
      },
      statistics: {
        totalLeads: total,
        leadsWithOpportunities: withDeals,
        wonCustomers: won,
        activeLeads: total - won,
      },
      statusDistribution: statusDistribution || [],
      leadsByStage: leadsByStageRes || [],
    });
  } catch (error) {
    console.error('Funnel analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate funnel', details: String(error) },
      { status: 500 }
    );
  }
}
