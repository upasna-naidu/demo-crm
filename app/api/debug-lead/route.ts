import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id') || 'lead-1';

    const lead = await queryOne('SELECT * FROM "Lead" WHERE id = $1', [leadId]);

    return NextResponse.json(lead || { error: 'Lead not found' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
