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
    initialized = true;
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    await pool.end();
  }
}
