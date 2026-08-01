import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Pipeline Health Analysis
    const pipelineRes = await query(
      `SELECT
        s.id,
        s.name,
        s.probability,
        COUNT(d.id) as dealCount,
        SUM(d.value) as stageValue,
        AVG(CAST((julianday('now') - julianday(d."createdAt")) AS INTEGER)) as avgDaysInStage,
        SUM(CASE WHEN d.status = ? THEN d.value ELSE 0 END) as wonValue,
        SUM(CASE WHEN d.status = ? THEN d.value ELSE 0 END) as lostValue
      FROM "PipelineStage" s
      LEFT JOIN "Deal" d ON d."stageId" = s.id AND d.status = ?
      GROUP BY s.id, s.name, s.probability
      ORDER BY s.probability ASC`,
      ['won', 'lost', 'open']
    );

    // Revenue Progression (Month over Month)
    const progressionRes = await query(
      `SELECT
        strftime('%Y-%m', d."createdAt") as month,
        s.name as stage,
        COUNT(d.id) as dealCount,
        SUM(d.value) as revenue,
        AVG(s.probability) as avgProbability
      FROM "Deal" d
      LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
      WHERE d.status = ? AND d."createdAt" >= date('now', '-6 months')
      GROUP BY month, stage
      ORDER BY month DESC, stage`,
      ['open']
    );

    // Deal Health Score (based on age, size, probability)
    const riskDealsRes = await query(
      `SELECT
        d.id,
        d."dealId",
        d.title,
        d.value,
        s.name as stage,
        d.probability,
        CAST((julianday('now') - julianday(d."createdAt")) AS INTEGER) as daysInStage,
        CASE
          WHEN CAST((julianday('now') - julianday(d."createdAt")) AS INTEGER) > 90 THEN 'at-risk'
          WHEN d.probability < 30 THEN 'low-probability'
          WHEN d.value < 5000 THEN 'small-deal'
          ELSE 'healthy'
        END as healthScore
      FROM "Deal" d
      LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
      WHERE d.status = ?
      ORDER BY daysInStage DESC
      LIMIT 20`,
      ['open']
    );

    // Owner Performance & Quota Tracking
    const ownerPerfRes = await query(
      `SELECT
        COALESCE(u.id, 'unassigned') as userId,
        COALESCE(u.name, 'Unassigned') as ownerName,
        COUNT(d.id) as dealCount,
        SUM(d.value) as totalValue,
        AVG(d.value) as avgValue,
        SUM(CASE WHEN d.status = ? THEN d.value ELSE 0 END) as wonValue,
        COUNT(CASE WHEN d.status = ? THEN 1 END) as wonCount,
        COUNT(l.id) as leadCount,
        SUM(CASE WHEN s.probability >= 50 THEN d.value ELSE 0 END) as committedPipeline
      FROM "Deal" d
      LEFT JOIN "User" u ON d."ownerId" = u.id
      LEFT JOIN "Lead" l ON d."leadId" = l.id
      LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
      WHERE d.status = ?
      GROUP BY userId, ownerName
      ORDER BY totalValue DESC`,
      ['won', 'won', 'open']
    );

    // Forecast vs Actual
    const currentMonthRes = await query(
      `SELECT
        SUM(d.value * (s.probability / 100.0)) as forecastedRevenue,
        SUM(CASE WHEN d.status = ? THEN d.value ELSE 0 END) as actualRevenue
      FROM "Deal" d
      LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
      WHERE strftime('%Y-%m', d."createdAt") = strftime('%Y-%m', 'now')`,
      ['won']
    );

    const currentMonth = currentMonthRes?.[0] || { forecastedRevenue: 0, actualRevenue: 0 };
    const forecastAccuracy =
      currentMonth.forecastedRevenue > 0
        ? Math.round((currentMonth.actualRevenue / currentMonth.forecastedRevenue) * 100)
        : 0;

    // Deal Velocity Metrics
    const velocityMetricsRes = await query(
      `SELECT
        COUNT(CASE WHEN CAST((julianday('now') - julianday(d."createdAt")) AS INTEGER) <= 30 THEN 1 END) as dealsUnder30Days,
        COUNT(CASE WHEN CAST((julianday('now') - julianday(d."createdAt")) AS INTEGER) > 30 AND CAST((julianday('now') - julianday(d."createdAt")) AS INTEGER) <= 60 THEN 1 END) as deals30to60,
        COUNT(CASE WHEN CAST((julianday('now') - julianday(d."createdAt")) AS INTEGER) > 60 THEN 1 END) as dealsOver60,
        AVG(d.value) as avgDealSize
      FROM "Deal" d
      WHERE d.status = ?`,
      ['open']
    );

    const velocityMetrics = velocityMetricsRes?.[0] || {
      dealsUnder30Days: 0,
      deals30to60: 0,
      dealsOver60: 0,
      avgDealSize: 0,
    };

    return NextResponse.json({
      success: true,
      pipelineHealth: pipelineRes || [],
      revenueProgression: progressionRes || [],
      dealHealth: riskDealsRes || [],
      ownerPerformance: ownerPerfRes || [],
      forecast: {
        forecastedRevenue: Math.round(currentMonth.forecastedRevenue || 0),
        actualRevenue: Math.round(currentMonth.actualRevenue || 0),
        accuracy: forecastAccuracy,
      },
      velocityMetrics,
      riskAlert: {
        atRiskDeals: (riskDealsRes || []).filter((d: any) => d.healthScore === 'at-risk').length,
        lowProbabilityDeals: (riskDealsRes || []).filter((d: any) => d.healthScore === 'low-probability')
          .length,
      },
    });
  } catch (error) {
    console.error('Revenue intelligence error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate revenue intelligence', details: String(error) },
      { status: 500 }
    );
  }
}
