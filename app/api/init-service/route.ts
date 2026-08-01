import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('\n========== INITIALIZING SERVICE HUB TABLES ==========\n');

    const tablesToDrop = ['Ticket', 'TicketComment', 'TicketTag', 'SLAPolicy', 'KnowledgeBase'];
    for (const table of tablesToDrop) {
      try {
        await run(`DROP TABLE IF EXISTS "${table}"`);
      } catch (e) {
        console.log(`Drop ${table} optional:`, e);
      }
    }

    // Ticket table - Support tickets
    console.log('[1/5] Creating Ticket table...');
    await run(`
      CREATE TABLE "Ticket" (
        id TEXT PRIMARY KEY,
        "ticketId" TEXT UNIQUE NOT NULL,
        "customerId" TEXT,
        "contactId" TEXT,
        "companyId" TEXT,
        subject TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'open',
        priority TEXT DEFAULT 'medium',
        category TEXT,
        "assignedTo" TEXT,
        "createdBy" TEXT,
        "resolvedAt" DATETIME,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("customerId") REFERENCES "Lead"(id),
        FOREIGN KEY("contactId") REFERENCES "Contact"(id),
        FOREIGN KEY("companyId") REFERENCES "Company"(id),
        FOREIGN KEY("assignedTo") REFERENCES "User"(id),
        FOREIGN KEY("createdBy") REFERENCES "User"(id)
      )
    `);

    // Insert sample tickets
    const tickets = [
      { id: 'ticket-1', ticketId: 'T001', subject: 'Login issues on mobile', priority: 'high', category: 'Technical' },
      { id: 'ticket-2', ticketId: 'T002', subject: 'Billing inquiry', priority: 'medium', category: 'Billing' },
      { id: 'ticket-3', ticketId: 'T003', subject: 'Feature request: dark mode', priority: 'low', category: 'Feature Request' },
    ];

    for (const ticket of tickets) {
      await run(
        `INSERT INTO "Ticket" (id, "ticketId", subject, priority, category, status, "createdAt", "updatedAt")
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [ticket.id, ticket.ticketId, ticket.subject, ticket.priority, ticket.category, 'open']
      );
    }
    console.log('  ✓ Ticket table created with 3 sample tickets');

    // TicketComment table - Comments and updates
    console.log('[2/5] Creating TicketComment table...');
    await run(`
      CREATE TABLE "TicketComment" (
        id TEXT PRIMARY KEY,
        "ticketId" TEXT NOT NULL,
        "authorId" TEXT,
        body TEXT NOT NULL,
        "isInternal" INTEGER DEFAULT 0,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("ticketId") REFERENCES "Ticket"(id),
        FOREIGN KEY("authorId") REFERENCES "User"(id)
      )
    `);
    console.log('  ✓ TicketComment table created');

    // TicketTag table - Tag system for organization
    console.log('[3/5] Creating TicketTag table...');
    await run(`
      CREATE TABLE "TicketTag" (
        id TEXT PRIMARY KEY,
        "ticketId" TEXT NOT NULL,
        tag TEXT NOT NULL,
        FOREIGN KEY("ticketId") REFERENCES "Ticket"(id)
      )
    `);
    console.log('  ✓ TicketTag table created');

    // SLAPolicy table - Service level agreements
    console.log('[4/5] Creating SLAPolicy table...');
    await run(`
      CREATE TABLE "SLAPolicy" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        priority TEXT NOT NULL,
        "responseTimeMinutes" INTEGER,
        "resolutionTimeMinutes" INTEGER,
        enabled INTEGER DEFAULT 1,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default SLA policies
    const policies = [
      { id: 'sla-1', name: 'Urgent', priority: 'critical', response: 15, resolution: 60 },
      { id: 'sla-2', name: 'High', priority: 'high', response: 30, resolution: 480 },
      { id: 'sla-3', name: 'Medium', priority: 'medium', response: 120, resolution: 1440 },
      { id: 'sla-4', name: 'Low', priority: 'low', response: 240, resolution: 2880 },
    ];

    for (const policy of policies) {
      await run(
        `INSERT INTO "SLAPolicy" (id, name, priority, "responseTimeMinutes", "resolutionTimeMinutes", enabled)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [policy.id, policy.name, policy.priority, policy.response, policy.resolution, 1]
      );
    }
    console.log('  ✓ SLAPolicy table created with 4 default policies');

    // KnowledgeBase table - Self-service articles
    console.log('[5/5] Creating KnowledgeBase table...');
    await run(`
      CREATE TABLE "KnowledgeBase" (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        category TEXT,
        "relatedTicketId" TEXT,
        views INTEGER DEFAULT 0,
        helpful INTEGER DEFAULT 0,
        published INTEGER DEFAULT 0,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample KB articles
    const articles = [
      { id: 'kb-1', title: 'How to reset your password', category: 'Account' },
      { id: 'kb-2', title: 'Getting started guide', category: 'Getting Started' },
      { id: 'kb-3', title: 'Billing FAQ', category: 'Billing' },
    ];

    for (const article of articles) {
      await run(
        `INSERT INTO "KnowledgeBase" (id, title, category, published, "createdAt", "updatedAt")
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [article.id, article.title, article.category, 1]
      );
    }
    console.log('  ✓ KnowledgeBase table created with 3 articles');

    console.log('\n========== SERVICE HUB TABLES READY ✅ ==========\n');

    return NextResponse.json({
      success: true,
      message: 'Service Hub tables initialized successfully',
      tables: 5,
      tickets: tickets.length,
      policies: policies.length,
      articles: articles.length
    });
  } catch (error) {
    console.error('❌ Failed to initialize service tables:', error);
    return NextResponse.json(
      { error: 'Failed to initialize tables', details: String(error) },
      { status: 500 }
    );
  }
}
