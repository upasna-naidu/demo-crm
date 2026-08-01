import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Create Note table
    await run(`
      CREATE TABLE IF NOT EXISTS "Note" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT NOT NULL,
        content TEXT NOT NULL,
        "authorId" TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("leadId") REFERENCES "Lead"(id)
      )
    `);

    // Create Email table
    await run(`
      CREATE TABLE IF NOT EXISTS "Email" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT,
        "from" TEXT,
        "to" TEXT,
        direction TEXT DEFAULT 'sent',
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("leadId") REFERENCES "Lead"(id)
      )
    `);

    // Create CallLog table
    await run(`
      CREATE TABLE IF NOT EXISTS "CallLog" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT NOT NULL,
        duration INTEGER,
        notes TEXT,
        "callTime" DATETIME,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("leadId") REFERENCES "Lead"(id)
      )
    `);

    // Create Activity table
    await run(`
      CREATE TABLE IF NOT EXISTS "Activity" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT NOT NULL,
        type TEXT,
        description TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("leadId") REFERENCES "Lead"(id)
      )
    `);

    // Create PaymentLink table
    await run(`
      CREATE TABLE IF NOT EXISTS "PaymentLink" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT NOT NULL,
        url TEXT,
        amount REAL,
        status TEXT DEFAULT 'pending',
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("leadId") REFERENCES "Lead"(id)
      )
    `);

    console.log('✅ All tables initialized');

    return NextResponse.json({
      success: true,
      message: 'All tables initialized: Note, Email, CallLog, Activity, PaymentLink',
    });
  } catch (error) {
    console.error('Failed to initialize tables:', error);
    return NextResponse.json(
      { error: 'Failed to initialize tables', details: String(error) },
      { status: 500 }
    );
  }
}
