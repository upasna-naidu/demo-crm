import { Pool } from 'pg';

let pool: Pool | null = null;
let isInitialized = false;

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
