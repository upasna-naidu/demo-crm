import sqlite3 from 'sqlite3';

let db: sqlite3.Database | null = null;

export function closeDB() {
  if (db) {
    db.close((err) => {
      if (err) console.error('DB close error:', err);
      else console.log('DB closed');
    });
    db = null;
  }
}

function getDB(): sqlite3.Database {
  if (!db) {
    db = new sqlite3.Database('./prisma/dev.db', (err) => {
      if (err) {
        console.error('DB connection error:', err);
      } else {
        console.log('DB connected successfully');
      }
    });
    db.configure('busyTimeout', 30000);
  }
  return db;
}

function convertSQL(sql: string, params: any[]): string {
  let sqliteSQL = sql;
  for (let i = params.length; i > 0; i--) {
    sqliteSQL = sqliteSQL.replace(`$${i}`, '?');
  }
  return sqliteSQL;
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const sqliteSQL = convertSQL(sql, params);
    getDB().all(sqliteSQL, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export async function queryOne(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const sqliteSQL = convertSQL(sql, params);
    getDB().get(sqliteSQL, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function run(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const sqliteSQL = convertSQL(sql, params);
    console.log('[DB.run] SQL:', sqliteSQL);
    console.log('[DB.run] Params:', params);

    const connection = getDB();
    connection.run(sqliteSQL, params, function(err) {
      if (err) {
        console.error('[DB.run] ERROR:', err);
        reject(err);
      } else {
        console.log('[DB.run] EXECUTED. Changes:', this.changes);
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}
