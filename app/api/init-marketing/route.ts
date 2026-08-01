import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('\n========== INITIALIZING MARKETING TABLES ==========\n');

    console.log('[1/1] Creating MarketingContent table...');
    await run(`CREATE TABLE IF NOT EXISTS "MarketingContent" (id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "contentType" TEXT NOT NULL, title TEXT, content TEXT, prompt TEXT, status TEXT DEFAULT 'draft', "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY("companyId") REFERENCES "Company"(id))`);
    console.log('  ✓ MarketingContent table created');

    console.log('\n========== MARKETING TABLES READY ✅ ==========\n');

    return NextResponse.json({
      success: true,
      message: 'Marketing tables initialized successfully',
    });
  } catch (error) {
    console.error('❌ Failed to initialize marketing tables:', error);
    return NextResponse.json(
      { error: 'Failed to initialize tables', details: String(error) },
      { status: 500 }
    );
  }
}
