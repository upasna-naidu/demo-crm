const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prisma/dev.db');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function main() {
  try {
    console.log('Starting SQLite seed...');

    // Clear data
    await run('DELETE FROM PaymentLink');
    await run('DELETE FROM Activity');
    await run('DELETE FROM Email');
    await run('DELETE FROM CallLog');
    await run('DELETE FROM Note');
    await run('DELETE FROM Lead');
    await run('DELETE FROM User');
    await run('DELETE FROM Stage');
    await run('DELETE FROM CustomField');

    // Create stages
    console.log('Creating stages...');
    const stages = [];
    const stageNames = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
    const colors = ['#E5E7EB', '#BFDBFE', '#A7F3D0', '#FED7AA', '#BBF7D0', '#FECACA'];

    for (let i = 0; i < stageNames.length; i++) {
      const res = await run(
        `INSERT INTO Stage (id, name, "order", color, createdAt, updatedAt)
         VALUES (lower(hex(randomblob(12))), ?, ?, ?, datetime('now'), datetime('now'))`,
        [stageNames[i], i + 1, colors[i]]
      );
      const stage = await get('SELECT id FROM Stage WHERE name = ?', [stageNames[i]]);
      stages.push(stage);
    }
    console.log(`✓ Created ${stages.length} stages`);

    // Create users
    console.log('Creating users...');
    const users = [];
    const userData = [
      ['Alice Chen', 'alice@crmdemo.local', 'admin'],
      ['Bob Martinez', 'bob@crmdemo.local', 'rep'],
      ['Carol Williams', 'carol@crmdemo.local', 'rep'],
    ];

    for (const [name, email, role] of userData) {
      await run(
        `INSERT INTO User (id, name, email, role, createdAt, updatedAt)
         VALUES (lower(hex(randomblob(12))), ?, ?, ?, datetime('now'), datetime('now'))`,
        [name, email, role]
      );
      const user = await get('SELECT id FROM User WHERE email = ?', [email]);
      users.push(user);
    }
    console.log(`✓ Created ${users.length} users`);

    // Create 30 leads
    console.log('Creating leads...');
    const companies = ['Acme Corp', 'TechFlow Inc', 'CloudStart', 'FinanceHub'];
    const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown'];

    for (let i = 1; i <= 30; i++) {
      const stageIdx = Math.min(Math.floor(i / 5), stages.length - 1);
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];

      await run(
        `INSERT INTO Lead (id, leadId, name, email, phone, company, stageId, ownerId, source, dealValue, customFields, createdAt, updatedAt)
         VALUES (lower(hex(randomblob(12))), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          `LD-${String(10000 + i).padStart(5, '0')}`,
          `${firstName} ${lastName}`,
          `user${i}@example.com`,
          `+1555000${String(i).padStart(4, '0')}`,
          companies[i % companies.length],
          stages[stageIdx].id,
          users[i % users.length].id,
          'website_organic',
          50000 + (i * 1000),
          JSON.stringify({ priority: 'High' }),
        ]
      );
    }
    console.log('✓ Created 30 leads');

    console.log('\n✅ Database seeded successfully!');
    console.log('   Stages: 6');
    console.log('   Users: 3');
    console.log('   Leads: 30');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
