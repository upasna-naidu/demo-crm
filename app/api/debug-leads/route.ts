import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check Lead table structure
    const tableInfo = await query(`PRAGMA table_info("Lead")`, []);

    // Get all leads without any mapping
    const leads = await query(`SELECT COUNT(*) as total FROM "Lead"`, []);
    const leadSample = await query(`SELECT id, name, email, leadId FROM "Lead" LIMIT 3`, []);

    return NextResponse.json({
      leadCount: leads?.[0]?.total || 0,
      sample: leadSample,
      tableColumns: tableInfo
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
