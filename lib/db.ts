import { Pool } from 'pg';

let pool: Pool | null = null;
let isInitialized = false;
let isSchemaCreated = false;

async function createSchema() {
  if (isSchemaCreated || !pool) return;

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

    isSchemaCreated = true;
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Schema creation error:', error);
  }
}

function initDb() {
  if (isInitialized) return;

  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL is required in production');
    }
    return;
  }

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    isInitialized = true;
    console.log('✅ Database pool initialized');
    createSchema().catch(err => console.error('Schema creation failed:', err));
  } catch (error) {
    console.error('❌ Failed to initialize database pool:', error);
    throw error;
  }
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  if (!pool) {
    initDb();
  }

  if (!pool) {
    throw new Error('Database not available. DATABASE_URL not set');
  }

  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Query error:', sql, params, error);
    throw error;
  }
}

export async function queryOne(sql: string, params: any[] = []): Promise<any> {
  if (!pool) {
    initDb();
  }

  if (!pool) {
    throw new Error('Database not available. DATABASE_URL not set');
  }

  try {
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.error('QueryOne error:', sql, params, error);
    throw error;
  }
}

export async function run(sql: string, params: any[] = []): Promise<any> {
  if (!pool) {
    initDb();
  }

  if (!pool) {
    throw new Error('Database not available. DATABASE_URL not set');
  }

  try {
    return await pool.query(sql, params);
  } catch (error) {
    console.error('Run error:', sql, params, error);
    throw error;
  }
}

// Initialize on module load
initDb();
