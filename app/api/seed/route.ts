import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    console.log('Starting database seed...');

    // Clear existing data
    await prisma.paymentLink.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.email.deleteMany();
    await prisma.callLog.deleteMany();
    await prisma.note.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.user.deleteMany();
    await prisma.stage.deleteMany();
    await prisma.customField.deleteMany();

    // Create stages
    const stages = await Promise.all([
      prisma.stage.create({ data: { name: 'New', order: 1, color: '#E5E7EB' } }),
      prisma.stage.create({ data: { name: 'Contacted', order: 2, color: '#BFDBFE' } }),
      prisma.stage.create({ data: { name: 'Qualified', order: 3, color: '#A7F3D0' } }),
      prisma.stage.create({ data: { name: 'Proposal Sent', order: 4, color: '#FED7AA' } }),
      prisma.stage.create({ data: { name: 'Negotiation', order: 5, color: '#F8B4D4' } }),
      prisma.stage.create({ data: { name: 'Won', order: 6, color: '#BBF7D0' } }),
      prisma.stage.create({ data: { name: 'Lost', order: 7, color: '#FECACA' } }),
    ]);

    // Create users
    const users = await Promise.all([
      prisma.user.create({ data: { name: 'Alice Chen', email: 'alice@crmdemo.local', role: 'admin' } }),
      prisma.user.create({ data: { name: 'Bob Martinez', email: 'bob@crmdemo.local', role: 'rep' } }),
      prisma.user.create({ data: { name: 'Carol Williams', email: 'carol@crmdemo.local', role: 'rep' } }),
      prisma.user.create({ data: { name: 'David Lee', email: 'david@crmdemo.local', role: 'rep' } }),
      prisma.user.create({ data: { name: 'Emma Johnson', email: 'emma@crmdemo.local', role: 'rep' } }),
    ]);

    // Create custom fields
    await Promise.all([
      prisma.customField.create({ data: { name: 'Industry', type: 'text' } }),
      prisma.customField.create({ data: { name: 'Employees', type: 'number' } }),
      prisma.customField.create({ data: { name: 'Priority', type: 'dropdown', options: JSON.stringify(['High', 'Medium', 'Low']) } }),
    ]);

    // Create leads
    const utmSources = ['google_ads', 'linkedin', 'referral', 'website_organic', 'facebook_ads'];
    const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
    const companies = ['Acme Corp', 'TechFlow Inc', 'CloudStart', 'FinanceHub', 'RetailPro'];

    function getRandomItem(arr: string[]) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    const stageDistribution = [8, 7, 6, 4, 3, 1, 1];
    let leadCounter = 1;

    for (let stageIdx = 0; stageIdx < stages.length; stageIdx++) {
      for (let i = 0; i < stageDistribution[stageIdx]; i++) {
        const leadNum = String(10000 + leadCounter).padStart(5, '0');
        const owner = users[Math.floor(Math.random() * users.length)];
        const source = getRandomItem(utmSources);

        const lead = await prisma.lead.create({
          data: {
            leadId: `LD-${leadNum}`,
            name: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
            email: `user${leadCounter}@example.com`,
            phone: `+1555000${String(leadCounter).padStart(4, '0')}`,
            company: getRandomItem(companies),
            stageId: stages[stageIdx].id,
            ownerId: owner.id,
            source,
            utmSource: source,
            utmMedium: getRandomItem(['cpc', 'organic', 'referral', 'direct']),
            utmCampaign: source === 'google_ads' ? 'Summer2024' : undefined,
            dealValue: Math.floor(Math.random() * 100000) + 5000,
            customFields: JSON.stringify({
              industry: getRandomItem(['SaaS', 'Finance', 'Retail', 'Healthcare']),
              employees: Math.floor(Math.random() * 5000) + 10,
              priority: getRandomItem(['High', 'Medium', 'Low']),
            }),
          },
        });

        // Add notes
        const noteCount = Math.floor(Math.random() * 3) + 1;
        for (let n = 0; n < noteCount; n++) {
          await prisma.note.create({
            data: {
              leadId: lead.id,
              authorId: owner.id,
              content: `Note ${n + 1}: Progress update on this lead. Following up on requirements.`,
            },
          });
        }

        // Add emails
        const emailCount = Math.floor(Math.random() * 3);
        for (let e = 0; e < emailCount; e++) {
          await prisma.email.create({
            data: {
              leadId: lead.id,
              authorId: owner.id,
              direction: Math.random() > 0.5 ? 'sent' : 'received',
              subject: `Email ${e + 1}: Proposal Discussion`,
              body: `This is a sample email body for lead communication.`,
              sentAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Add calls
        if (Math.random() > 0.6) {
          await prisma.callLog.create({
            data: {
              leadId: lead.id,
              notes: 'Call discussion notes',
              duration: Math.floor(Math.random() * 45) + 5,
              callTime: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Add activities
        const activityTypes = ['stage_change', 'note', 'email', 'call'];
        for (let a = 0; a < Math.floor(Math.random() * 3) + 1; a++) {
          const actType = getRandomItem(activityTypes);
          await prisma.activity.create({
            data: {
              leadId: lead.id,
              type: actType,
              description: `${actType.replace(/_/g, ' ')}: Activity entry`,
            },
          });
        }

        leadCounter++;
      }
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: `✅ Seeded database with ${leadCounter - 1} leads across ${stages.length} stages`,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
