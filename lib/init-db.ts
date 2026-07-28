import { Pool } from 'pg';

let initialized = false;

export async function initializeDatabase() {
  if (initialized || !process.env.DATABASE_URL) {
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'Sales Rep',
        organization TEXT,
        status TEXT DEFAULT 'active',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Stage" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT,
        "order" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Lead" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        source TEXT,
        "utmSource" TEXT,
        "utmMedium" TEXT,
        "utmCampaign" TEXT,
        "utmTerm" TEXT,
        "utmContent" TEXT,
        "stageId" TEXT REFERENCES "Stage"(id),
        "ownerId" TEXT REFERENCES "User"(id),
        "dealValue" DECIMAL,
        "customFields" JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Note" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT REFERENCES "Lead"(id),
        "authorId" TEXT REFERENCES "User"(id),
        content TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Email" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT REFERENCES "Lead"(id),
        subject TEXT,
        body TEXT,
        direction TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "CallLog" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT REFERENCES "Lead"(id),
        duration INTEGER,
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Activity" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT REFERENCES "Lead"(id),
        type TEXT,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "PaymentLink" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT REFERENCES "Lead"(id),
        url TEXT,
        amount DECIMAL,
        status TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables initialized');

    // Add sample data if tables are empty
    const userCount = await pool.query('SELECT COUNT(*) as count FROM "User"');
    if (userCount.rows[0].count === 0) {
      console.log('📝 Adding sample data...');

      // Insert sample users
      await pool.query(`
        INSERT INTO "User" (id, name, email, role, organization, status)
        VALUES
          ('user-1', 'Alice Johnson', 'alice@crmdemo.local', 'Admin', 'Company A', 'active'),
          ('user-2', 'Bob Smith', 'bob@crmdemo.local', 'Sales Rep', 'Company A', 'active'),
          ('user-3', 'Carol White', 'carol@crmdemo.local', 'Super Admin', 'Company A', 'active')
      `);

      // Insert sample stages
      await pool.query(`
        INSERT INTO "Stage" (id, name, color, "order")
        VALUES
          ('stage-1', 'New', '#3b82f6', 1),
          ('stage-2', 'Qualified', '#10b981', 2),
          ('stage-3', 'Negotiation', '#f59e0b', 3),
          ('stage-4', 'Closed', '#6b7280', 4)
      `);

      // Insert sample leads
      await pool.query(`
        INSERT INTO "Lead" (id, "leadId", name, email, phone, company, source, "stageId", "ownerId", "dealValue", "createdAt")
        VALUES
          ('lead-1', 'L001', 'Acme Corp', 'contact@acme.com', '+1234567890', 'Acme Inc', 'website', 'stage-1', 'user-2', 50000, NOW()),
          ('lead-2', 'L002', 'TechStart LLC', 'hello@techstart.com', '+1234567891', 'TechStart', 'referral', 'stage-2', 'user-2', 75000, NOW()),
          ('lead-3', 'L003', 'Global Solutions', 'sales@global.com', '+1234567892', 'Global Solutions', 'email', 'stage-3', 'user-3', 100000, NOW())
      `);

      console.log('✅ Sample data added');
    }

    initialized = true;
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    await pool.end();
  }
}
