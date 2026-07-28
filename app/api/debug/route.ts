import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const users = await query('SELECT COUNT(*) as count FROM "User"');
    const stages = await query('SELECT COUNT(*) as count FROM "Stage"');
    const leads = await query('SELECT COUNT(*) as count FROM "Lead"');
    const notes = await query('SELECT COUNT(*) as count FROM "Note"');
    const emails = await query('SELECT COUNT(*) as count FROM "Email"');
    const calls = await query('SELECT COUNT(*) as count FROM "CallLog"');

    return NextResponse.json({
      database_status: 'Connected',
      tables: {
        users: users[0]?.count || 0,
        stages: stages[0]?.count || 0,
        leads: leads[0]?.count || 0,
        notes: notes[0]?.count || 0,
        emails: emails[0]?.count || 0,
        calls: calls[0]?.count || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        database_status: 'Error',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
