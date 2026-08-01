let db: any = null;

// Determine which database to use
const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  console.log('Using PostgreSQL database');
} else {
  console.log('Using SQLite database');
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
    // SQLite
    const sqlite3 = await import('sqlite3');
    return new Promise<any>((resolve, reject) => {
      const database = new sqlite3.default.Database('./prisma/dev.db', (err: any) => {
        if (err) {
          console.error('DB connection error:', err);
          reject(err);
        } else {
          console.log('SQLite DB connected successfully');
          database.configure('busyTimeout', 30000);
          resolve(database);
        }
      });
    });
  }

  return db;
}

function convertSQL(sql: string, params: any[]): { sql: string; params: any[] } {
  if (usePostgres) {
    // PostgreSQL uses $1, $2, etc (already in the SQL)
    return { sql, params };
  } else {
    // SQLite uses ?
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
    return new Promise((resolve: any, reject: any) => {
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
