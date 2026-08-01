import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('\n========== INITIALIZING COMPANY TABLES ==========\n');

    // Company table
    console.log('[1/3] Creating Company table...');
    await run(`CREATE TABLE IF NOT EXISTS "Company" (id TEXT PRIMARY KEY, name TEXT NOT NULL, website TEXT, industry TEXT, description TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    console.log('  ✓ Company table created');

    // CompanyUser relationship table
    console.log('[2/3] Creating CompanyUser table...');
    await run(`CREATE TABLE IF NOT EXISTS "CompanyUser" (id TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "companyId" TEXT NOT NULL, role TEXT DEFAULT 'member', "joinedAt" DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE("userId", "companyId"), FOREIGN KEY("userId") REFERENCES "User"(id), FOREIGN KEY("companyId") REFERENCES "Company"(id))`);
    console.log('  ✓ CompanyUser table created');

    // Company Profile / Brand Brief table
    console.log('[3/3] Creating CompanyProfile table...');
    await run(`CREATE TABLE IF NOT EXISTS "CompanyProfile" (id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL UNIQUE, "brandName" TEXT, "targetAudience" TEXT, tone TEXT, industry TEXT, icp TEXT, "values" TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY("companyId") REFERENCES "Company"(id))`);
    console.log('  ✓ CompanyProfile table created');

    console.log('\n========== COMPANY TABLES READY ✅ ==========\n');

    return NextResponse.json({
      success: true,
      message: 'Company tables initialized successfully',
    });
  } catch (error) {
    console.error('❌ Failed to initialize company tables:', error);
    return NextResponse.json(
      { error: 'Failed to initialize tables', details: String(error) },
      { status: 500 }
    );
  }
}
