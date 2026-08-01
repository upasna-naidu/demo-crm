import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Drop and recreate to ensure schema is correct
    try {
      await run(`DROP TABLE IF EXISTS "EmailTemplate"`);
    } catch (e) {
      console.log('Drop table optional:', e);
    }

    await run(`CREATE TABLE "EmailTemplate" (id TEXT PRIMARY KEY, name TEXT NOT NULL, "templateType" TEXT DEFAULT 'general', subject TEXT NOT NULL, body TEXT NOT NULL, "companyId" TEXT, description TEXT, status TEXT DEFAULT 'draft', variables TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP)`);

    console.log('✅ EmailTemplate table initialized');

    return NextResponse.json({
      success: true,
      message: 'EmailTemplate table initialized',
    });
  } catch (error) {
    console.error('Failed to initialize EmailTemplate table:', error);
    return NextResponse.json(
      { error: 'Failed to initialize table', details: String(error) },
      { status: 500 }
    );
  }
}
