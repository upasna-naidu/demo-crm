import { NextRequest, NextResponse } from 'next/server';
import { run, query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Resetting database with dummy data...');

    // Clear existing data
    try {
      await run(`DELETE FROM "Lead"`);
      await run(`DELETE FROM "User"`);
      await run(`DELETE FROM "Stage"`);
    } catch (e) {
      console.log('Tables might not exist yet');
    }

    // Insert users
    await run(`
      INSERT INTO "User" (id, name, email, role, "createdAt", "updatedAt")
      VALUES
        ('user-1', 'Alice Johnson', 'alice@crmdemo.local', 'Super Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('user-2', 'Bob Smith', 'bob@crmdemo.local', 'Sales Rep', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('user-3', 'Carol White', 'carol@crmdemo.local', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('user-4', 'David Brown', 'david@crmdemo.local', 'Sales Manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('user-5', 'Emma Davis', 'emma@crmdemo.local', 'Sales Rep', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    // Insert stages
    await run(`
      INSERT INTO "Stage" (id, name, color, "order", "createdAt", "updatedAt")
      VALUES
        ('stage-1', 'New', '#3b82f6', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('stage-2', 'Qualified', '#10b981', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('stage-3', 'Negotiation', '#f59e0b', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('stage-4', 'Proposal', '#8b5cf6', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('stage-5', 'Closed Won', '#06b6d4', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('stage-6', 'Closed Lost', '#6b7280', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    // Generate 50 dummy leads
    const companies = [
      'Acme Corp', 'TechStart', 'Global Industries', 'Innovation Labs', 'Future Systems',
      'NextGen Tech', 'Enterprise Solutions', 'Digital Ventures', 'Cloud Innovations', 'Smart Systems',
      'Peak Performance', 'Velocity Group', 'Quantum Dynamics', 'Stellar Group', 'Apex Solutions',
      'Horizon Ventures', 'Nexus Technologies', 'Prism Systems', 'Beacon Analytics', 'Forge Industries',
      'Helix Solutions', 'Pivot Dynamics', 'Zenith Partners', 'Aurora Tech', 'Catalyst Ventures',
      'Pulse Systems', 'Quantum Leap', 'Nexwave Technologies', 'Infinity Solutions', 'Orbit Systems'
    ];

    const sources = ['website', 'email', 'referral', 'demo', 'partner', 'event', 'inbound'];
    const stages = ['stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5', 'stage-6'];
    const users = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];

    // Insert leads one by one
    for (let i = 1; i <= 100; i++) {
      const company = companies[(i - 1) % companies.length];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const owner = users[Math.floor(Math.random() * users.length)];
      const dealValue = Math.floor(Math.random() * 500000) + 10000;

      const leadId = `L${String(i).padStart(3, '0')}`;
      const name = `${company} - Contact ${i}`;
      const email = `contact${i}@test.com`;
      const phone = `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      await run(
        `INSERT INTO "Lead" (id, "leadId", name, email, phone, company, source, "stageId", "ownerId", "dealValue", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          `lead-${i}`,
          leadId,
          name,
          email,
          phone,
          company,
          source,
          stage,
          owner,
          dealValue
        ]
      );
    }

    console.log('✅ Database reset with 100 dummy leads');

    return NextResponse.json({
      success: true,
      message: 'Database reset with 100 dummy leads',
      stats: {
        leads: 100,
        users: 5,
        stages: 6
      }
    });
  } catch (error) {
    console.error('❌ Reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset data', details: String(error) },
      { status: 500 }
    );
  }
}
