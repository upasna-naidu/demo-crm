let db: any = null;

// Determine which database to use
const usePostgres = !!process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

if (usePostgres) {
  console.log('Using PostgreSQL database');
} else if (isProduction) {
  console.log('Using in-memory SQLite database (Vercel/serverless mode)');
} else {
  console.log('Using local SQLite database');
}

async function getDB() {
  if (db) return db;

  if (usePostgres) {
    // PostgreSQL
    const pg = await import('pg');
    const { Pool } = pg;
    db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    db.on('error', (err: any) => console.error('Unexpected error on idle client', err));
  } else {
    // SQLite - use in-memory for serverless, file-based for local dev
    const sqlite3 = await import('sqlite3');
    const dbPath = isProduction ? ':memory:' : './prisma/dev.db';

    return new Promise<any>((resolve, reject) => {
      const database = new sqlite3.default.Database(dbPath, async (err: any) => {
        if (err) {
          console.error('DB connection error:', err);
          reject(err);
        } else {
          console.log(`SQLite DB connected (${isProduction ? 'in-memory' : 'file-based'})`);
          database.configure('busyTimeout', 30000);

          // Initialize tables in-memory
          if (isProduction) {
            try {
              await initializeTables(database);
            } catch (initErr) {
              console.error('Table initialization error:', initErr);
            }
          }

          resolve(database);
        }
      });
    });
  }

  return db;
}

async function initializeTables(database: any) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS "Lead" (
      id TEXT PRIMARY KEY,
      "leadId" TEXT,
      name TEXT,
      email TEXT,
      phone TEXT,
      company TEXT,
      title TEXT,
      source TEXT,
      "stageId" TEXT,
      "ownerId" TEXT,
      status TEXT DEFAULT 'new',
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Deal" (
      id TEXT PRIMARY KEY,
      "dealId" TEXT,
      "leadId" TEXT,
      title TEXT,
      value INTEGER,
      currency TEXT,
      "stageId" TEXT,
      probability INTEGER,
      status TEXT DEFAULT 'open',
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "PipelineStage" (
      id TEXT PRIMARY KEY,
      name TEXT,
      probability INTEGER,
      "displayOrder" INTEGER
    )`,
  ];

  return new Promise<void>((resolve, reject) => {
    let completed = 0;
    for (const sql of tables) {
      database.run(sql, (err: any) => {
        if (err) console.error('Table creation error:', err);
        completed++;
        if (completed === tables.length) resolve();
      });
    }
  });
}

function convertSQL(sql: string, params: any[]): { sql: string; params: any[] } {
  if (usePostgres) {
    return { sql, params };
  } else {
    let sqliteSQL = sql;
    for (let i = params.length; i > 0; i--) {
      sqliteSQL = sqliteSQL.replace(`$${i}`, '?');
    }
    return { sql: sqliteSQL, params };
  }
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  const converted = convertSQL(sql, params);

  if (usePostgres) {
    const pool = await getDB();
    const result = await pool.query(converted.sql, converted.params);
    return result.rows;
  } else {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      database.all(converted.sql, converted.params, (err: any, rows: any) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

export async function queryOne(sql: string, params: any[] = []): Promise<any> {
  const converted = convertSQL(sql, params);

  if (usePostgres) {
    const pool = await getDB();
    const result = await pool.query(converted.sql, converted.params);
    return result.rows[0] || null;
  } else {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      database.get(converted.sql, converted.params, (err: any, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
}

export async function run(sql: string, params: any[] = []): Promise<any> {
  const converted = convertSQL(sql, params);

  console.log('[DB.run] SQL:', converted.sql);
  console.log('[DB.run] Params:', converted.params);

  if (usePostgres) {
    const pool = await getDB();
    const result = await pool.query(converted.sql, converted.params);
    return { lastID: null, changes: result.rowCount };
  } else {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      database.run(converted.sql, converted.params, function (err: any) {
        if (err) {
          console.error('[DB.run] ERROR:', err);
          return reject(err);
        }
        // @ts-ignore
        const ctx = this;
        const changes = ctx.changes || 0;
        const lastID = ctx.lastID || null;
        console.log('[DB.run] EXECUTED. Changes:', changes);
        resolve({ lastID, changes });
      });
    });
  }
}

export async function closeDB() {
  if (usePostgres && db) {
    await db.end();
    db = null;
  } else if (!usePostgres && db) {
    db.close((err: any) => {
      if (err) console.error('DB close error:', err);
      else console.log('SQLite DB closed');
    });
    db = null;
  }
}
