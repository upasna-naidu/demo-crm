const path = require('path');
const Module = require('module');
const originalRequire = Module.prototype.require;

// Patch require to redirect .prisma/client imports to the correct location
Module.prototype.require = function(id) {
  if (id === '.prisma/client/default') {
    return originalRequire.call(this, path.join(__dirname, '..', 'node_modules', '.prisma', 'client', 'default'));
  }
  return originalRequire.call(this, id);
};

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const utmSources = ['google_ads', 'linkedin', 'referral', 'website_organic', 'facebook_ads', 'direct', 'email_campaign'];
const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const companies = ['Acme Corp', 'TechFlow Inc', 'DataViz Solutions', 'CloudStart', 'FinanceHub', 'RetailPro', 'HealthTech', 'AgriGrow', 'EduLearn', 'TransportX'];

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
  console.log('Seeding database...');

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
  const stageDistribution = [8, 7, 6, 4, 3, 1, 1]; // distribution across stages
  let leadCounter = 1;

  for (let stageIdx = 0; stageIdx < stages.length; stageIdx++) {
    for (let i = 0; i < stageDistribution[stageIdx]; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const company = getRandomItem(companies);
      const owner = getRandomItem(users);
      const source = getRandomItem(utmSources);
      const leadNum = String(10000 + leadCounter).padStart(5, '0');

      const lead = await prisma.lead.create({
        data: {
          leadId: `LD-${leadNum}`,
          name: `${firstName} ${lastName}`,
          email: getRandomEmail(),
          phone: getRandomPhone(),
          company,
          stageId: stages[stageIdx].id,
          ownerId: owner.id,
          source,
          utmSource: source,
          utmMedium: ['cpc', 'organic', 'referral', 'direct'][Math.floor(Math.random() * 4)],
          utmCampaign: source === 'google_ads' ? 'Summer2024' : source === 'linkedin' ? 'Q3Campaign' : undefined,
          dealValue: Math.floor(Math.random() * 100000) + 5000,
          customFields: JSON.stringify({
            industry: getRandomItem(['SaaS', 'Finance', 'Retail', 'Healthcare']),
            employees: Math.floor(Math.random() * 5000) + 10,
            priority: getRandomItem(['High', 'Medium', 'Low']),
          }),
        },
      });

      // Add 1-3 notes per lead
      const noteCount = Math.floor(Math.random() * 3) + 1;
      for (let n = 0; n < noteCount; n++) {
        await prisma.note.create({
          data: {
            leadId: lead.id,
            authorId: owner.id,
            content: `Note ${n + 1}: Progress update on this lead. Followed up on requirements.`,
          },
        });
      }

      // Add 0-2 emails per lead
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

      // Add 0-1 calls per lead
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

      // Create activity entries for timeline
      const activityTypes = ['stage_change', 'note', 'email', 'call'];
      for (let a = 0; a < Math.floor(Math.random() * 3) + 1; a++) {
        const actType = getRandomItem(activityTypes);
        await prisma.activity.create({
          data: {
            leadId: lead.id,
            type: actType,
            description: `${actType.replace('_', ' ')}: Activity entry`,
          },
        });
      }

      leadCounter++;
    }
  }

  console.log('✓ Database seeded successfully');
  console.log(`✓ Created ${leadCounter - 1} leads across ${stages.length} stages`);
  console.log(`✓ Created ${users.length} users`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
