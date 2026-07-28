import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data - ignore errors if tables don't exist
    console.log('🗑️  Clearing existing data...');
    try {
      await run(`DELETE FROM "PaymentLink"`);
    } catch (e) {}
    try {
      await run(`DELETE FROM "Activity"`);
    } catch (e) {}
    try {
      await run(`DELETE FROM "CallLog"`);
    } catch (e) {}
    try {
      await run(`DELETE FROM "Email"`);
    } catch (e) {}
    try {
      await run(`DELETE FROM "Note"`);
    } catch (e) {}
    try {
      await run(`DELETE FROM "Lead"`);
    } catch (e) {}
    try {
      await run(`DELETE FROM "User"`);
    } catch (e) {}
    try {
      await run(`DELETE FROM "Stage"`);
    } catch (e) {}

    console.log('✅ Data cleared')

    // Insert users
    console.log('👥 Adding users...');
    await run(`
      INSERT INTO "User" (id, name, email, role, organization, status)
      VALUES
        ('user-1', 'Alice Johnson', 'alice@crmdemo.local', 'Super Admin', 'Acme Corp', 'active'),
        ('user-2', 'Bob Smith', 'bob@crmdemo.local', 'Sales Rep', 'Acme Corp', 'active'),
        ('user-3', 'Carol White', 'carol@crmdemo.local', 'Admin', 'Acme Corp', 'active'),
        ('user-4', 'David Brown', 'david@crmdemo.local', 'Sales Manager', 'Acme Corp', 'active'),
        ('user-5', 'Emma Davis', 'emma@crmdemo.local', 'Sales Rep', 'Acme Corp', 'active')
    `);

    // Insert stages
    console.log('📋 Adding stages...');
    await run(`
      INSERT INTO "Stage" (id, name, color, "order")
      VALUES
        ('stage-1', 'New', '#3b82f6', 1),
        ('stage-2', 'Qualified', '#10b981', 2),
        ('stage-3', 'Negotiation', '#f59e0b', 3),
        ('stage-4', 'Proposal', '#8b5cf6', 4),
        ('stage-5', 'Closed Won', '#06b6d4', 5),
        ('stage-6', 'Closed Lost', '#6b7280', 6)
    `);

    // Insert leads
    console.log('📞 Adding leads...');
    await run(`
      INSERT INTO "Lead" (id, "leadId", name, email, phone, company, source, "stageId", "ownerId", "dealValue", "createdAt", "updatedAt")
      VALUES
        ('lead-1', 'L001', 'Acme Corporation', 'john.doe@acme.com', '+1-555-0101', 'Acme Corporation', 'website', 'stage-2', 'user-2', 150000, NOW(), NOW()),
        ('lead-2', 'L002', 'TechStart Solutions', 'sarah.smith@techstart.com', '+1-555-0102', 'TechStart Solutions', 'referral', 'stage-3', 'user-2', 75000, NOW(), NOW()),
        ('lead-3', 'L003', 'Global Industries', 'michael.brown@global.com', '+1-555-0103', 'Global Industries', 'email', 'stage-2', 'user-3', 200000, NOW(), NOW()),
        ('lead-4', 'L004', 'Innovation Labs', 'emily.wilson@innovationlabs.com', '+1-555-0104', 'Innovation Labs', 'demo', 'stage-1', 'user-5', 95000, NOW(), NOW()),
        ('lead-5', 'L005', 'Future Systems', 'robert.johnson@future.com', '+1-555-0105', 'Future Systems', 'partner', 'stage-4', 'user-2', 250000, NOW(), NOW()),
        ('lead-6', 'L006', 'NextGen Tech', 'laura.anderson@nextgen.com', '+1-555-0106', 'NextGen Tech', 'website', 'stage-5', 'user-4', 180000, NOW(), NOW()),
        ('lead-7', 'L007', 'Enterprise Solutions', 'james.taylor@enterprise.com', '+1-555-0107', 'Enterprise Solutions', 'event', 'stage-3', 'user-3', 320000, NOW(), NOW()),
        ('lead-8', 'L008', 'Digital Ventures', 'maria.garcia@digital.com', '+1-555-0108', 'Digital Ventures', 'inbound', 'stage-2', 'user-5', 110000, NOW(), NOW()),
        ('lead-9', 'L009', 'Cloud Innovations', 'thomas.martinez@cloud.com', '+1-555-0109', 'Cloud Innovations', 'referral', 'stage-1', 'user-2', 85000, NOW(), NOW()),
        ('lead-10', 'L010', 'Smart Systems Inc', 'patricia.lee@smart.com', '+1-555-0110', 'Smart Systems Inc', 'website', 'stage-4', 'user-4', 275000, NOW(), NOW()),
        ('lead-11', 'L011', 'Peak Performance', 'christopher.white@peak.com', '+1-555-0111', 'Peak Performance', 'demo', 'stage-3', 'user-2', 165000, NOW(), NOW()),
        ('lead-12', 'L012', 'Velocity Group', 'jennifer.harris@velocity.com', '+1-555-0112', 'Velocity Group', 'email', 'stage-6', 'user-5', 120000, NOW(), NOW())
    `);

    // Insert notes
    console.log('📝 Adding notes...');
    await run(`
      INSERT INTO "Note" (id, "leadId", "authorId", content, "createdAt")
      VALUES
        ('note-1', 'lead-1', 'user-2', 'Initial discovery call - very interested in our solution', NOW()),
        ('note-2', 'lead-2', 'user-2', 'Sent proposal for $75k deal', NOW()),
        ('note-3', 'lead-3', 'user-3', 'CFO approval pending - follow up next week', NOW()),
        ('note-4', 'lead-5', 'user-2', 'Negotiations ongoing - great potential for upsell', NOW()),
        ('note-5', 'lead-6', 'user-4', 'Contract signed - implementation starts next month', NOW())
    `);

    // Insert emails
    console.log('📧 Adding emails...');
    await run(`
      INSERT INTO "Email" (id, "leadId", subject, body, direction, "createdAt")
      VALUES
        ('email-1', 'lead-1', 'RE: Product Demo', 'Thanks for the demo yesterday. Can we schedule a follow-up?', 'received', NOW()),
        ('email-2', 'lead-2', 'Proposal Sent', 'Please find attached our proposal for your review.', 'sent', NOW()),
        ('email-3', 'lead-3', 'Budget Approval', 'Getting approval from finance, back to you by Friday', 'received', NOW()),
        ('email-4', 'lead-5', 'Contract Review', 'Legal team has reviewed - minor changes requested', 'received', NOW()),
        ('email-5', 'lead-6', 'Welcome to Partnership', 'Welcome aboard! Implementation team will contact you.', 'sent', NOW())
    `);

    // Insert call logs
    console.log('☎️  Adding call logs...');
    await run(`
      INSERT INTO "CallLog" (id, "leadId", duration, notes, "createdAt")
      VALUES
        ('call-1', 'lead-1', 45, 'Initial discovery call with CTO', NOW()),
        ('call-2', 'lead-3', 30, 'Budget discussion with CFO', NOW()),
        ('call-3', 'lead-5', 60, 'Deep dive technical presentation', NOW()),
        ('call-4', 'lead-7', 35, 'Demo and questions answered', NOW()),
        ('call-5', 'lead-11', 50, 'Contract negotiation call', NOW())
    `);

    console.log('✅ Database seeding completed successfully!');
    return {
      success: true,
      message: 'Database seeded with sample data'
    };
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ GET /api/seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ POST /api/seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
