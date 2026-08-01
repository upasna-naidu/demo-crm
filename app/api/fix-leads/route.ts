import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Fixing leads data...');

    // Get all leads
    const leads = await query('SELECT id FROM "Lead" ORDER BY "createdAt" ASC', []);

    // Get default stage
    const stages = await query('SELECT id FROM "PipelineStage" LIMIT 1', []);
    const defaultStageId = stages?.[0]?.id || 'stage-prospect';

    // Update each lead with proper leadId and stageId
    for (let i = 0; i < (leads?.length || 0); i++) {
      const lead = leads[i];
      const leadId = `L${String(i + 1).padStart(3, '0')}`;

      await run(
        'UPDATE "Lead" SET "leadId" = ?, "stageId" = ? WHERE id = ?',
        [leadId, defaultStageId, lead.id]
      );
    }

    console.log(`✅ Updated ${leads?.length || 0} leads with IDs and stages`);

    return NextResponse.json({
      success: true,
      message: `Fixed ${leads?.length || 0} leads`,
      updated: leads?.length || 0
    });
  } catch (error) {
    console.error('Failed to fix leads:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
