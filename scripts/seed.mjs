import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const utmSources = ['google_ads', 'linkedin', 'referral', 'website_organic', 'facebook_ads'];
const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
const companies = ['Acme Corp', 'TechFlow Inc', 'CloudStart', 'FinanceHub', 'RetailPro'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomEmail() {
  return `user${Math.floor(Math.random() * 10000)}@example.com`;
}

function getRandomPhone() {
  return `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000).slice(0, 10)}`;
}

async function main() {
  try {
    console.log('Clearing existing data...');
    await prisma.paymentLink.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.email.deleteMany();
    await prisma.callLog.deleteMany();
    await prisma.note.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.user.deleteMany();
    await prisma.stage.deleteMany();
    await prisma.customField.deleteMany();

    console.log('Creating stages...');
    const stages = await Promise.all([
      prisma.stage.create({ data: { name: 'New', order: 1, color: '#E5E7EB' } }),
      prisma.stage.create({ data: { name: 'Contacted', order: 2, color: '#BFDBFE' } }),
      prisma.stage.create({ data: { name: 'Qualified', order: 3, color: '#A7F3D0' } }),
      prisma.stage.create({ data: { name: 'Proposal Sent', order: 4, color: '#FED7AA' } }),
      prisma.stage.create({ data: { name: 'Won', order: 6, color: '#BBF7D0' } }),
    ]);

    console.log('Creating users...');
    const users = await Promise.all([
      prisma.user.create({ data: { name: 'Alice Chen', email: 'alice@crmdemo.local', role: 'admin' } }),
      prisma.user.create({ data: { name: 'Bob Martinez', email: 'bob@crmdemo.local', role: 'rep' } }),
      prisma.user.create({ data: { name: 'Carol Williams', email: 'carol@crmdemo.local', role: 'rep' } }),
    ]);

    console.log('Creating custom fields...');
    await Promise.all([
      prisma.customField.create({ data: { name: 'Industry', type: 'text' } }),
      prisma.customField.create({ data: { name: 'Priority', type: 'dropdown', options: JSON.stringify(['High', 'Medium', 'Low']) } }),
    ]);

    console.log('Creating leads...');
    let leadCounter = 1;
    const stageDistribution = [5, 4, 3, 2, 1];

    for (let stageIdx = 0; stageIdx < stages.length; stageIdx++) {
      for (let i = 0; i < stageDistribution[stageIdx]; i++) {
        const leadNum = String(10000 + leadCounter).padStart(5, '0');
        await prisma.lead.create({
          data: {
            leadId: `LD-${leadNum}`,
            name: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
            email: getRandomEmail(),
            phone: getRandomPhone(),
            company: getRandomItem(companies),
            stageId: stages[stageIdx].id,
            ownerId: getRandomItem(users).id,
            source: getRandomItem(utmSources),
            dealValue: Math.floor(Math.random() * 100000) + 5000,
            customFields: JSON.stringify({ priority: getRandomItem(['High', 'Medium', 'Low']) }),
          },
        });
        leadCounter++;
      }
    }

    console.log(`✓ Database seeded with ${leadCounter - 1} leads`);
    console.log('✓ Seeding complete!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
