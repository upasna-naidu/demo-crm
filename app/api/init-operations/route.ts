import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('\n========== INITIALIZING OPERATIONS HUB TABLES ==========\n');

    // Drop existing tables
    const tablesToDrop = ['WorkflowRule', 'LeadQualityMetric', 'WorkflowExecution'];
    for (const table of tablesToDrop) {
      try {
        await run(`DROP TABLE IF EXISTS "${table}"`);
      } catch (e) {
        console.log(`Drop ${table} optional:`, e);
      }
    }

    // WorkflowRule table - Define automation rules
    console.log('[1/3] Creating WorkflowRule table...');
    await run(`
      CREATE TABLE "WorkflowRule" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        "triggerType" TEXT,
        "triggerValue" TEXT,
        "actionType" TEXT,
        "actionValue" TEXT,
        priority INTEGER DEFAULT 0,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default lead routing rules
    const rules = [
      { id: 'rule-1', name: 'Route Website Leads', trigger: 'website', action: 'assign_round_robin' },
      { id: 'rule-2', name: 'Route LinkedIn Leads', trigger: 'linkedin', action: 'assign_round_robin' },
      { id: 'rule-3', name: 'Route Email Leads', trigger: 'email', action: 'assign_round_robin' },
      { id: 'rule-4', name: 'Detect Duplicates', trigger: 'on_create', action: 'detect_duplicates' },
      { id: 'rule-5', name: 'Validate Data', trigger: 'on_create', action: 'validate_data' },
    ];

    for (const rule of rules) {
      await run(
        `INSERT INTO "WorkflowRule" (id, name, type, enabled, "triggerType", "actionType", priority)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [rule.id, rule.name, 'lead_routing', 1, rule.trigger, rule.action, rules.indexOf(rule)]
      );
    }
    console.log('  ✓ WorkflowRule table created with 5 default rules');

    // LeadQualityMetric table - Track data quality
    console.log('[2/3] Creating LeadQualityMetric table...');
    await run(`
      CREATE TABLE "LeadQualityMetric" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT NOT NULL,
        "completeness" INTEGER DEFAULT 0,
        "isDuplicate" INTEGER DEFAULT 0,
        "duplicateLeadId" TEXT,
        "missingFields" TEXT,
        score INTEGER DEFAULT 0,
        notes TEXT,
        "checkDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("leadId") REFERENCES "Lead"(id)
      )
    `);
    console.log('  ✓ LeadQualityMetric table created');

    // WorkflowExecution table - Track automation runs
    console.log('[3/3] Creating WorkflowExecution table...');
    await run(`
      CREATE TABLE "WorkflowExecution" (
        id TEXT PRIMARY KEY,
        "ruleId" TEXT NOT NULL,
        "leadId" TEXT,
        status TEXT DEFAULT 'pending',
        result TEXT,
        "executedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("ruleId") REFERENCES "WorkflowRule"(id),
        FOREIGN KEY("leadId") REFERENCES "Lead"(id)
      )
    `);
    console.log('  ✓ WorkflowExecution table created');

    console.log('\n========== OPERATIONS HUB TABLES READY ✅ ==========\n');

    return NextResponse.json({
      success: true,
      message: 'Operations Hub tables initialized successfully',
      rules: rules.length
    });
  } catch (error) {
    console.error('❌ Failed to initialize operations tables:', error);
    return NextResponse.json(
      { error: 'Failed to initialize tables', details: String(error) },
      { status: 500 }
    );
  }
}
