import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Marketing Metrics
    const emailTemplatesRes = await query(
      'SELECT COUNT(*) as cnt FROM "EmailTemplate"',
      []
    );
    const emailCount = emailTemplatesRes?.[0]?.cnt || 0;

    // Sales Metrics
    const dealsRes = await query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as won,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as lost,
        SUM(value) as totalValue,
        AVG(value) as avgValue
      FROM "Deal"`,
      ['open', 'won', 'lost']
    );

    const dealMetrics = dealsRes?.[0] || {
      total: 0,
      open: 0,
      won: 0,
      lost: 0,
      totalValue: 0,
      avgValue: 0,
    };

    // Lead Metrics
    const leadsRes = await query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as new,
        SUM(CASE WHEN "ownerId" IS NULL THEN 1 ELSE 0 END) as unassigned
      FROM "Lead"`,
      ['new']
    );

    const leadMetrics = leadsRes?.[0] || {
      total: 0,
      new: 0,
      unassigned: 0,
    };

    // Operations Metrics
    const qualityRes = await query(
      'SELECT AVG(score) as avgScore FROM "LeadQualityMetric"',
      []
    );
    const qualityScore = Math.round(qualityRes?.[0]?.avgScore || 0);

    const execRes = await query(
      'SELECT COUNT(*) as cnt FROM "WorkflowExecution" WHERE status = ?',
      ['success']
    );
    const automationSuccesses = execRes?.[0]?.cnt || 0;

    // Service Metrics
    const ticketsRes = await query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as resolved,
        AVG(CASE WHEN "resolvedAt" IS NOT NULL THEN CAST((julianday("resolvedAt") - julianday("createdAt")) AS INTEGER) ELSE NULL END) as avgResolutionHours
      FROM "Ticket"`,
      ['open', 'resolved']
    );

    const ticketMetrics = ticketsRes?.[0] || {
      total: 0,
      open: 0,
      resolved: 0,
      avgResolutionHours: 0,
    };

    // Company Metrics
    const companiesRes = await query(
      'SELECT COUNT(*) as cnt FROM "Company"',
      []
    );
    const companyCount = companiesRes?.[0]?.cnt || 0;

    // Win Rate
    const totalClosed = (dealMetrics.won || 0) + (dealMetrics.lost || 0);
    const winRate = totalClosed > 0 ? Math.round(((dealMetrics.won || 0) / totalClosed) * 100) : 0;

    // Team Activity
    const usersRes = await query('SELECT id, name FROM "User"', []);
    const users = usersRes || [];

    // Get user performance
    const userPerformance = await Promise.all(
      users.map(async (user: any) => {
        const userDeals = await query(
          'SELECT COUNT(*) as cnt, SUM(value) as total FROM "Deal" WHERE "ownerId" = ? AND status = ?',
          [user.id, 'open']
        );
        const userLeads = await query(
          'SELECT COUNT(*) as cnt FROM "Lead" WHERE "ownerId" = ?',
          [user.id]
        );
        return {
          name: user.name,
          deals: userDeals?.[0]?.cnt || 0,
          dealValue: userDeals?.[0]?.total || 0,
          leads: userLeads?.[0]?.cnt || 0,
        };
      })
    );

    // Activity Trend (last 7 days)
    const trendsRes = await query(
      `SELECT
        strftime('%Y-%m-%d', d."createdAt") as date,
        COUNT(d.id) as dealCount,
        SUM(d.value) as dealValue,
        (SELECT COUNT(*) FROM "Lead" l WHERE strftime('%Y-%m-%d', l."createdAt") = strftime('%Y-%m-%d', d."createdAt")) as leadCount
      FROM "Deal" d
      WHERE d."createdAt" >= date('now', '-7 days')
      GROUP BY date
      ORDER BY date DESC`,
      []
    );

    const trends = trendsRes || [];

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overview: {
        companies: companyCount,
        leads: leadMetrics.total,
        deals: dealMetrics.total,
        tickets: ticketMetrics.total,
        emailTemplates: emailCount,
      },
      sales: {
        totalPipeline: Math.round(dealMetrics.totalValue || 0),
        openDeals: dealMetrics.open,
        wonDeals: dealMetrics.won,
        lostDeals: dealMetrics.lost,
        winRate,
        avgDealSize: Math.round(dealMetrics.avgValue || 0),
      },
      leads: {
        total: leadMetrics.total,
        new: leadMetrics.new,
        unassigned: leadMetrics.unassigned,
        qualityScore,
      },
      operations: {
        workflowsExecuted: automationSuccesses,
        dataQuality: qualityScore,
      },
      service: {
        totalTickets: ticketMetrics.total,
        openTickets: ticketMetrics.open,
        resolvedTickets: ticketMetrics.resolved,
        avgResolutionHours: Math.round(ticketMetrics.avgResolutionHours || 0),
      },
      teamPerformance: userPerformance,
      activityTrend: trends,
    });
  } catch (error) {
    console.error('Master dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load master dashboard', details: String(error) },
      { status: 500 }
    );
  }
}
