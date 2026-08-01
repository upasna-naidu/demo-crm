import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('\n========== INITIALIZING NOTES TABLES ==========\n');

    // Drop and recreate for schema updates
    try {
      await run(`DROP TABLE IF EXISTS "Note"`);
    } catch (e) {
      console.log('Drop optional:', e);
    }

    console.log('[1/1] Creating Note table...');
    await run(`CREATE TABLE "Note" (id TEXT PRIMARY KEY, "leadId" TEXT NOT NULL, "companyId" TEXT, title TEXT, content TEXT NOT NULL, "createdBy" TEXT, "updatedBy" TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY("leadId") REFERENCES "Lead"(id))`);
    console.log('  ✓ Note table created');

    console.log('\n========== NOTES TABLES READY ✅ ==========\n');

    return NextResponse.json({
      success: true,
      message: 'Notes table initialized successfully',
    });
  } catch (error) {
    console.error('❌ Failed to initialize notes table:', error);
    return NextResponse.json(
      { error: 'Failed to initialize table', details: String(error) },
      { status: 500 }
    );
  }
}
