import { Pool } from 'pg';

let pool: Pool | null = null;

export function initDb() {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL environment variable is required in production');
  }

  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
}

export function query(sql: string, params: any[] = []): Promise<any> {
  if (!pool) {
    throw new Error('Database not initialized. Call initDb() first or set DATABASE_URL');
  }
  return pool.query(sql, params).then(res => res.rows);
}

export function queryOne(sql: string, params: any[] = []): Promise<any> {
  if (!pool) {
    throw new Error('Database not initialized. Call initDb() first or set DATABASE_URL');
  }
  return pool.query(sql, params).then(res => res.rows[0]);
}

export function run(sql: string, params: any[] = []): Promise<any> {
  if (!pool) {
    throw new Error('Database not initialized. Call initDb() first or set DATABASE_URL');
  }
  return pool.query(sql, params);
}
