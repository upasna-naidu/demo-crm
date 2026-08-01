import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all deals with their stage info
    const deals = await query(
      `SELECT d.*, s.name as stageName, s.probability
       FROM "Deal" d
       LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
       WHERE d.status = ?`,
      ['open']
    );

    if (!deals || deals.length === 0) {
      return NextResponse.json({
        success: true,
        totalPipeline: 0,
        weightedForecast: 0,
        bestCase: 0,
        worstCase: 0,
        dealsByStage: [],
        trendData: []
      });
    }

    let totalPipeline = 0;
    let weightedForecast = 0;
    let bestCase = 0;
    let worstCase = 0;

    const stageMap = new Map<string, { count: number; value: number; probability: number }>();

    for (const deal of deals) {
      const stageId = deal.stageId;
      const value = deal.value || 0;
      const probability = deal.probability || 0;

      totalPipeline += value;
      weightedForecast += value * (probability / 100);
      bestCase += value * (probability > 75 ? 1 : probability / 100);
      worstCase += value * (probability > 50 ? 0.3 : 0);

      if (!stageMap.has(stageId)) {
        stageMap.set(stageId, { count: 0, value: 0, probability });
      }

      const stage = stageMap.get(stageId)!;
      stage.count += 1;
      stage.value += value;
    }

    // Get deals by stage
    const dealsByStage = Array.from(stageMap.entries()).map(([stageId, data]) => ({
      stageId,
      stageName: deals.find((d: any) => d.stageId === stageId)?.stageName,
      dealCount: data.count,
      totalValue: data.value,
      probability: data.probability,
      weightedValue: Math.round(data.value * (data.probability / 100))
    }));

    // Get trend data by creation month
    const trendRes = await query(
      `SELECT
        strftime('%Y-%m', d."createdAt") as month,
        COUNT(*) as dealCount,
        SUM(d.value) as totalValue,
        AVG(s.probability) as avgProbability
      FROM "Deal" d
      LEFT JOIN "PipelineStage" s ON d."stageId" = s.id
      WHERE d.status = ?
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6`,
      ['open']
    );

    return NextResponse.json({
      success: true,
      totalPipeline: Math.round(totalPipeline),
      weightedForecast: Math.round(weightedForecast),
      bestCase: Math.round(bestCase),
      worstCase: Math.round(worstCase),
      dealsByStage,
      trendData: trendRes || [],
      dealCount: deals.length
    });
  } catch (error) {
    console.error('Forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate forecast', details: String(error) },
      { status: 500 }
    );
  }
}
