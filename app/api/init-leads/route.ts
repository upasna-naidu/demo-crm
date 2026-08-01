import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('\n========== INITIALIZING LEADS TABLES ==========\n');

    // Drop and recreate to ensure schema is correct
    try {
      await run(`DROP TABLE IF EXISTS "Lead"`);
    } catch (e) {
      console.log('Drop Lead table optional:', e);
    }

    // Lead table
    console.log('[1/3] Creating Lead table...');
    await run(`CREATE TABLE "Lead" (id TEXT PRIMARY KEY, "leadId" TEXT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, company TEXT, title TEXT, source TEXT, "stageId" TEXT, "ownerId" TEXT, notes TEXT, status TEXT DEFAULT 'new', "utmSource" TEXT, "utmMedium" TEXT, "utmCampaign" TEXT, "utmTerm" TEXT, "utmContent" TEXT, "customFields" TEXT, "dealValue" TEXT, "companyId" TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    console.log('  ✓ Lead table created');

    // Stage table
    console.log('[2/3] Creating Stage table...');
    await run(`CREATE TABLE IF NOT EXISTS "Stage" (id TEXT PRIMARY KEY, name TEXT NOT NULL, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    console.log('  ✓ Stage table created');

    // User table (for owner)
    console.log('[3/3] Creating User table...');
    await run(`CREATE TABLE IF NOT EXISTS "User" (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    console.log('  ✓ User table created');

    console.log('\n========== LEADS TABLES READY ✅ ==========\n');

    return NextResponse.json({
      success: true,
      message: 'Leads tables initialized successfully',
    });
  } catch (error) {
    console.error('❌ Failed to initialize leads tables:', error);
    return NextResponse.json(
      { error: 'Failed to initialize tables', details: String(error) },
      { status: 500 }
    );
  }
}
