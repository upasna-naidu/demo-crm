import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const leads = await query('SELECT id, name, email, company FROM "Lead" LIMIT 5');
    const count = await query('SELECT COUNT(*) as total FROM "Lead"');

    return NextResponse.json({
      count: count?.[0]?.total || 0,
      sampleLeads: leads || [],
      leadTableExists: leads !== undefined
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      message: 'Database error'
    });
  }
}
