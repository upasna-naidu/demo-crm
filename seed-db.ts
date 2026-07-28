import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  try {
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
    console.log('Creating stages...');
    const stages = await Promise.all([
      prisma.stage.create({ data: { name: 'New', order: 1, color: '#E5E7EB' } }),
      prisma.stage.create({ data: { name: 'Contacted', order: 2, color: '#BFDBFE' } }),
      prisma.stage.create({ data: { name: 'Qualified', order: 3, color: '#A7F3D0' } }),
      prisma.stage.create({ data: { name: 'Proposal Sent', order: 4, color: '#FED7AA' } }),
      prisma.stage.create({ data: { name: 'Won', order: 6, color: '#BBF7D0' } }),
      prisma.stage.create({ data: { name: 'Lost', order: 7, color: '#FECACA' } }),
    ]);

    // Create users
    console.log('Creating users...');
    const users = await Promise.all([
      prisma.user.create({ data: { name: 'Alice Chen', email: 'alice@crmdemo.local', role: 'admin' } }),
      prisma.user.create({ data: { name: 'Bob Martinez', email: 'bob@crmdemo.local', role: 'rep' } }),
      prisma.user.create({ data: { name: 'Carol Williams', email: 'carol@crmdemo.local', role: 'rep' } }),
      prisma.user.create({ data: { name: 'David Lee', email: 'david@crmdemo.local', role: 'rep' } }),
      prisma.user.create({ data: { name: 'Emma Johnson', email: 'emma@crmdemo.local', role: 'rep' } }),
    ]);

    // Create custom fields
    console.log('Creating custom fields...');
    await Promise.all([
      prisma.customField.create({ data: { name: 'Industry', type: 'text' } }),
      prisma.customField.create({ data: { name: 'Employees', type: 'number' } }),
      prisma.customField.create({ data: { name: 'Priority', type: 'dropdown', options: JSON.stringify(['High', 'Medium', 'Low']) } }),
    ]);

    // Create leads
    console.log('Creating leads...');
    const utmSources = ['google_ads', 'linkedin', 'referral', 'website_organic', 'facebook_ads'];
    const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
    const companies = ['Acme Corp', 'TechFlow Inc', 'CloudStart', 'FinanceHub', 'RetailPro'];

    function getRandomItem(arr: string[]) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    const stageDistribution = [8, 7, 6, 4, 3, 2, 1];
    let leadCounter = 1;

    for (let stageIdx = 0; stageIdx < stages.length; stageIdx++) {
      for (let i = 0; i < stageDistribution[stageIdx]; i++) {
        const leadNum = String(10000 + leadCounter).padStart(5, '0');
        const owner = users[Math.floor(Math.random() * users.length)];
        const source = getRandomItem(utmSources);

        await prisma.lead.create({
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
            dealValue: Math.floor(Math.random() * 100000) + 5000,
            customFields: JSON.stringify({
              industry: getRandomItem(['SaaS', 'Finance', 'Retail', 'Healthcare']),
              priority: getRandomItem(['High', 'Medium', 'Low']),
            }),
          },
        });

        // Add some notes/emails per lead
        if (Math.random() > 0.5) {
          await prisma.note.create({
            data: {
              leadId: await prisma.lead.findUnique({ where: { leadId: `LD-${leadNum}` } }).then(l => l?.id || ''),
              authorId: owner.id,
              content: 'Initial contact notes',
            },
          });
        }

        leadCounter++;
      }
    }

    console.log(`✅ Seeded ${leadCounter - 1} leads successfully!`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
