const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prisma/dev.db');

const utmSources = ['google_ads', 'linkedin', 'referral', 'website_organic', 'facebook_ads'];
const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
const companies = ['Acme Corp', 'TechFlow Inc', 'CloudStart', 'FinanceHub', 'RetailPro'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function main() {
  try {
    console.log('Starting direct SQLite seed...');

    // Clear existing data
    console.log('Clearing existing data...');
    await runAsync('DELETE FROM PaymentLink');
    await runAsync('DELETE FROM Activity');
    await runAsync('DELETE FROM Email');
    await runAsync('DELETE FROM CallLog');
    await runAsync('DELETE FROM Note');
    await runAsync('DELETE FROM Lead');
    await runAsync('DELETE FROM User');
    await runAsync('DELETE FROM Stage');
    await runAsync('DELETE FROM CustomField');

    // Create stages
    console.log('Creating stages...');
    const stages = [];
    const stageData = [
      ['New', 1, '#E5E7EB'],
      ['Contacted', 2, '#BFDBFE'],
      ['Qualified', 3, '#A7F3D0'],
      ['Proposal Sent', 4, '#FED7AA'],
      ['Won', 6, '#BBF7D0'],
      ['Lost', 7, '#FECACA'],
    ];

    for (const [name, order, color] of stageData) {
      const stmt = await getAsync(
        `INSERT INTO Stage (id, name, "order", color, createdAt, updatedAt)
         VALUES (lower(hex(randomblob(12))), ?, ?, ?, datetime('now'), datetime('now'));
         SELECT last_insert_rowid() as id`,
        [name, order, color]
      );
      stages.push({ id: stmt.id, name });
    }

    console.log(`Created ${stages.length} stages`);

    // Create users
    console.log('Creating users...');
    const users = [];
    const userData = [
      ['Alice Chen', 'alice@crmdemo.local', 'admin'],
      ['Bob Martinez', 'bob@crmdemo.local', 'rep'],
      ['Carol Williams', 'carol@crmdemo.local', 'rep'],
      ['David Lee', 'david@crmdemo.local', 'rep'],
      ['Emma Johnson', 'emma@crmdemo.local', 'rep'],
    ];

    for (const [name, email, role] of userData) {
      await runAsync(
        `INSERT INTO User (id, name, email, role, createdAt, updatedAt)
         VALUES (lower(hex(randomblob(12))), ?, ?, ?, datetime('now'), datetime('now'))`,
        [name, email, role]
      );
      const user = await getAsync('SELECT id FROM User WHERE email = ?', [email]);
      users.push(user);
    }

    console.log(`Created ${users.length} users`);

    // Create custom fields
    console.log('Creating custom fields...');
    await runAsync(
      `INSERT INTO CustomField (id, name, type, createdAt, updatedAt)
       VALUES (lower(hex(randomblob(12))), ?, ?, datetime('now'), datetime('now'))`,
      ['Industry', 'text']
    );
    await runAsync(
      `INSERT INTO CustomField (id, name, type, options, createdAt, updatedAt)
       VALUES (lower(hex(randomblob(12))), ?, ?, ?, datetime('now'), datetime('now'))`,
      ['Priority', 'dropdown', JSON.stringify(['High', 'Medium', 'Low'])]
    );

    // Create leads
    console.log('Creating leads...');
    const stageDistribution = [8, 7, 5, 4, 2];
    let leadCounter = 1;

    for (let stageIdx = 0; stageIdx < Math.min(stageDistribution.length, stages.length); stageIdx++) {
      for (let i = 0; i < stageDistribution[stageIdx]; i++) {
        const leadNum = String(10000 + leadCounter).padStart(5, '0');
        const owner = users[Math.floor(Math.random() * users.length)];
        const source = getRandomItem(utmSources);

        await runAsync(
          `INSERT INTO Lead (id, leadId, name, email, phone, company, stageId, ownerId, source, utmSource, customFields, dealValue, createdAt, updatedAt)
           VALUES (lower(hex(randomblob(12))), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            `LD-${leadNum}`,
            `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
            `user${leadCounter}@example.com`,
            `+1555000${String(leadCounter).padStart(4, '0')}`,
            getRandomItem(companies),
            stages[stageIdx].id,
            owner.id,
            source,
            source,
            JSON.stringify({ priority: getRandomItem(['High', 'Medium', 'Low']) }),
            Math.floor(Math.random() * 100000) + 5000,
          ]
        );

        leadCounter++;
      }
    }

    console.log(`✅ Created ${leadCounter - 1} leads!`);
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
