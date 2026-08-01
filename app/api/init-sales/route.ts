import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('\n========== INITIALIZING SALES HUB TABLES ==========\n');

    // Drop existing tables to ensure clean schema
    const tablesToDrop = ['Deal', 'DealActivity', 'PipelineStage'];
    for (const table of tablesToDrop) {
      try {
        await run(`DROP TABLE IF EXISTS "${table}"`);
      } catch (e) {
        console.log(`Drop ${table} optional:`, e);
      }
    }

    // PipelineStage table - Define sales pipeline stages
    console.log('[1/3] Creating PipelineStage table...');
    await run(`
      CREATE TABLE "PipelineStage" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        "displayOrder" INTEGER,
        probability INTEGER DEFAULT 0,
        description TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default stages
    const defaultStages = [
      { id: 'stage-prospect', name: 'Prospect', order: 1, prob: 10 },
      { id: 'stage-qualified', name: 'Qualified', order: 2, prob: 25 },
      { id: 'stage-proposal', name: 'Proposal', order: 3, prob: 50 },
      { id: 'stage-negotiation', name: 'Negotiation', order: 4, prob: 75 },
      { id: 'stage-won', name: 'Won', order: 5, prob: 100 },
      { id: 'stage-lost', name: 'Lost', order: 6, prob: 0 },
    ];

    for (const stage of defaultStages) {
      await run(
        `INSERT INTO "PipelineStage" (id, name, "displayOrder", probability) VALUES (?, ?, ?, ?)`,
        [stage.id, stage.name, stage.order, stage.prob]
      );
    }
    console.log('  ✓ PipelineStage table created with default stages');

    // Deal table - Core deal/opportunity tracking
    console.log('[2/3] Creating Deal table...');
    await run(`
      CREATE TABLE "Deal" (
        id TEXT PRIMARY KEY,
        "dealId" TEXT UNIQUE,
        "leadId" TEXT NOT NULL,
        "contactId" TEXT,
        "companyId" TEXT,
        title TEXT NOT NULL,
        description TEXT,
        value REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        "stageId" TEXT NOT NULL,
        "ownerId" TEXT,
        "probability" INTEGER DEFAULT 0,
        "expectedCloseDate" DATETIME,
        "actualCloseDate" DATETIME,
        status TEXT DEFAULT 'open',
        "customFields" TEXT,
        "createdBy" TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("leadId") REFERENCES "Lead"(id),
        FOREIGN KEY("stageId") REFERENCES "PipelineStage"(id)
      )
    `);
    console.log('  ✓ Deal table created');

    // DealActivity table - Track deal interactions
    console.log('[3/3] Creating DealActivity table...');
    await run(`
      CREATE TABLE "DealActivity" (
        id TEXT PRIMARY KEY,
        "dealId" TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT,
        description TEXT,
        "activityDate" DATETIME,
        "createdBy" TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("dealId") REFERENCES "Deal"(id)
      )
    `);
    console.log('  ✓ DealActivity table created');

    console.log('\n========== SALES HUB TABLES READY ✅ ==========\n');

    return NextResponse.json({
      success: true,
      message: 'Sales Hub tables initialized successfully',
      stages: defaultStages
    });
  } catch (error) {
    console.error('❌ Failed to initialize sales tables:', error);
    return NextResponse.json(
      { error: 'Failed to initialize tables', details: String(error) },
      { status: 500 }
    );
  }
}
