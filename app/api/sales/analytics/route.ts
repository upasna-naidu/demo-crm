import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Win/Loss analysis
    const winLossRes = await query(
      `SELECT
        SUM(CASE WHEN d.status = ? THEN d.value ELSE 0 END) as won,
        SUM(CASE WHEN d.status = ? THEN d.value ELSE 0 END) as lost,
        COUNT(CASE WHEN d.status = ? THEN 1 END) as wonCount,
        COUNT(CASE WHEN d.status = ? THEN 1 END) as lostCount
      FROM "Deal" d`,
      ['won', 'lost', 'won', 'lost']
    );

    const winLoss = winLossRes?.[0] || { won: 0, lost: 0, wonCount: 0, lostCount: 0 };
    const totalClosed = (winLoss.won || 0) + (winLoss.lost || 0);
    const winRate = totalClosed > 0 ? Math.round(((winLoss.won || 0) / totalClosed) * 100) : 0;

    // Deal age analysis
    const ageRes = await query(
      `SELECT
        AVG(CASE WHEN d.status = ? THEN CAST((julianday('now') - julianday(d."createdAt")) AS INTEGER) ELSE NULL END) as avgDealAge,
        MAX(CASE WHEN d.status = ? THEN CAST((julianday('now') - julianday(d."createdAt")) AS INTEGER) ELSE NULL END) as maxDealAge
      FROM "Deal" d`,
      ['open', 'open']
    );

    const age = ageRes?.[0] || { avgDealAge: 0, maxDealAge: 0 };

    // Average deal size
    const sizeRes = await query(
      `SELECT
        AVG(value) as avgSize,
        MAX(value) as maxSize,
        MIN(value) as minSize,
        COUNT(*) as total
      FROM "Deal"
      WHERE status = ?`,
      ['open']
    );

    const size = sizeRes?.[0] || { avgSize: 0, maxSize: 0, minSize: 0, total: 0 };

    // Stage conversion metrics
    const stageMetricsRes = await query(
      `SELECT
        s.name,
        COUNT(d.id) as dealCount,
        AVG(s.probability) as avgProbability,
        SUM(d.value) as totalValue
      FROM "Deal" d
      LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
      WHERE d.status = ?
      GROUP BY d."stageId", s.name
      ORDER BY s.probability DESC`,
      ['open']
    );

    // Source analysis
    const sourceRes = await query(
      `SELECT
        l.source,
        COUNT(DISTINCT d.id) as dealCount,
        SUM(d.value) as totalValue,
        AVG(s.probability) as avgProbability
      FROM "Deal" d
      LEFT JOIN "Lead" l ON d."leadId" = l.id
      LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
      WHERE d.status = ?
      GROUP BY l.source
      ORDER BY totalValue DESC`,
      ['open']
    );

    // Owner performance
    const ownerRes = await query(
      `SELECT
        COALESCE(u.name, 'Unassigned') as ownerName,
        COUNT(d.id) as dealCount,
        SUM(d.value) as totalValue,
        AVG(s.probability) as avgProbability
      FROM "Deal" d
      LEFT JOIN "User" u ON d."ownerId" = u.id
      LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
      WHERE d.status = ?
      GROUP BY d."ownerId", u.name
      ORDER BY totalValue DESC`,
      ['open']
    );

    return NextResponse.json({
      success: true,
      winLoss: {
        won: winLoss.won || 0,
        lost: winLoss.lost || 0,
        wonCount: winLoss.wonCount || 0,
        lostCount: winLoss.lostCount || 0,
        winRate
      },
      dealMetrics: {
        averageAge: Math.round(age.avgDealAge || 0),
        maxAge: Math.round(age.maxDealAge || 0),
        averageSize: Math.round(size.avgSize || 0),
        maxSize: Math.round(size.maxSize || 0),
        minSize: Math.round(size.minSize || 0),
        totalOpen: size.total || 0
      },
      stageMetrics: stageMetricsRes || [],
      sourceMetrics: sourceRes || [],
      ownerMetrics: ownerRes || []
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate analytics', details: String(error) },
      { status: 500 }
    );
  }
}
