import { Pool } from 'pg';
import sqlite3 from 'sqlite3';

let pool: Pool | null = null;

export function initDb() {
  if (process.env.DATABASE_URL) {
    // Production: Use PostgreSQL
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
}

export function isPostgres() {
  return !!process.env.DATABASE_URL;
}

export function query(sql: string, params: any[] = []): Promise<any> {
  if (isPostgres() && pool) {
    return pool.query(sql, params).then(res => res.rows);
  } else {
    // Development: Use SQLite
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database('./prisma/dev.db');

      // Convert PostgreSQL-style $1, $2 to SQLite ?
      let sqliteSQL = sql;
      for (let i = params.length; i > 0; i--) {
        sqliteSQL = sqliteSQL.replace(`$${i}`, '?');
      }

      db.all(sqliteSQL, params, (err, rows) => {
        db.close();
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

export function queryOne(sql: string, params: any[] = []): Promise<any> {
  if (isPostgres() && pool) {
    return pool.query(sql, params).then(res => res.rows[0]);
  } else {
    // Development: Use SQLite
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database('./prisma/dev.db');

      // Convert PostgreSQL-style $1, $2 to SQLite ?
      let sqliteSQL = sql;
      for (let i = params.length; i > 0; i--) {
        sqliteSQL = sqliteSQL.replace(`$${i}`, '?');
      }

      db.get(sqliteSQL, params, (err, row) => {
        db.close();
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

export function run(sql: string, params: any[] = []): Promise<any> {
  if (isPostgres() && pool) {
    return pool.query(sql, params);
  } else {
    // Development: Use SQLite
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database('./prisma/dev.db');

      // Convert PostgreSQL-style $1, $2 to SQLite ?
      let sqliteSQL = sql;
      for (let i = params.length; i > 0; i--) {
        sqliteSQL = sqliteSQL.replace(`$${i}`, '?');
      }

      db.run(sqliteSQL, params, function(err) {
        db.close();
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
}
