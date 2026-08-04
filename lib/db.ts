let db: any = null;
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || '';
const usePostgres = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

if (usePostgres) {
  console.log('Using PostgreSQL database');
} else if (isProduction) {
  console.log('Using fallback in-memory SQLite (Vercel)');
} else {
  console.log('Using local SQLite database');
}

async function getDB() {
  if (db) return db;

  if (usePostgres) {
    const pg = await import('pg');
    const { Pool } = pg;
    db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    db.on('error', (err: any) => console.error('Unexpected error on idle client', err));
  } else {
    const sqlite3 = await import('sqlite3');
    const dbPath = isProduction ? ':memory:' : './prisma/dev.db';

    db = await new Promise<any>((resolve, reject) => {
      const database = new sqlite3.default.Database(dbPath, (err: any) => {
        if (err) {
          console.error('DB connection error:', err);
          reject(err);
        } else {
          database.configure('busyTimeout', 30000);
          resolve(database);
        }
      });
    });

    // Initialize tables
    await initializeTables(db);
  }

  return db;
}

async function initializeTables(database: any) {
  const tables = [
    // Role-based access control tables
    `CREATE TABLE IF NOT EXISTS "Role" (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, description TEXT)`,
    `CREATE TABLE IF NOT EXISTS "Permission" (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, description TEXT)`,
    `CREATE TABLE IF NOT EXISTS "RolePermission" (id TEXT PRIMARY KEY, "roleId" TEXT NOT NULL, "permissionId" TEXT NOT NULL, UNIQUE("roleId", "permissionId"))`,
    `CREATE TABLE IF NOT EXISTS "CompanyUser" (id TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "companyId" TEXT NOT NULL, "roleId" TEXT NOT NULL, "isAdmin" INTEGER DEFAULT 0, UNIQUE("userId", "companyId"))`,
    `CREATE TABLE IF NOT EXISTS "UserTeam" (id TEXT PRIMARY KEY, "managerId" TEXT NOT NULL, "memberId" TEXT NOT NULL, "companyId" TEXT NOT NULL, UNIQUE("managerId", "memberId", "companyId"))`,

    // Updated User table with roleId
    `CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      "roleId" TEXT,
      "managerId" TEXT,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS "Company" (id TEXT PRIMARY KEY, name TEXT NOT NULL, "adminId" TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "Lead" (
      id TEXT PRIMARY KEY, "leadId" TEXT, name TEXT, email TEXT, phone TEXT, company TEXT,
      title TEXT, source TEXT, "stageId" TEXT, "ownerId" TEXT, status TEXT DEFAULT 'new',
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "PipelineStage" (id TEXT PRIMARY KEY, name TEXT, probability INTEGER, "displayOrder" INTEGER)`,
    `CREATE TABLE IF NOT EXISTS "Deal" (
      id TEXT PRIMARY KEY, "dealId" TEXT, "leadId" TEXT, title TEXT, value INTEGER, currency TEXT,
      "stageId" TEXT, probability INTEGER, status TEXT DEFAULT 'open', "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "EmailTemplate" (id TEXT PRIMARY KEY, name TEXT, subject TEXT, body TEXT, status TEXT)`,
    `CREATE TABLE IF NOT EXISTS "Ticket" (id TEXT PRIMARY KEY, "ticketId" TEXT, subject TEXT, status TEXT, priority TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "WorkflowRule" (id TEXT PRIMARY KEY, name TEXT, enabled INTEGER DEFAULT 1)`,
    `CREATE TABLE IF NOT EXISTS "LeadQualityMetric" (id TEXT PRIMARY KEY, "leadId" TEXT, score INTEGER, "checkDate" DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS "Automation" (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      enabled INTEGER DEFAULT 1,
      "createdBy" TEXT,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "AutomationNode" (
      id TEXT PRIMARY KEY,
      "automationId" TEXT NOT NULL,
      type TEXT NOT NULL,
      label TEXT,
      position TEXT,
      config TEXT,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("automationId") REFERENCES "Automation"(id)
    )`,
    `CREATE TABLE IF NOT EXISTS "AutomationEdge" (
      id TEXT PRIMARY KEY,
      "automationId" TEXT NOT NULL,
      "fromNodeId" TEXT NOT NULL,
      "toNodeId" TEXT NOT NULL,
      label TEXT,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("automationId") REFERENCES "Automation"(id)
    )`,
    `CREATE TABLE IF NOT EXISTS "AutomationExecution" (
      id TEXT PRIMARY KEY,
      "automationId" TEXT NOT NULL,
      "triggeredBy" TEXT,
      "triggeredValue" TEXT,
      status TEXT DEFAULT 'running',
      "startedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "completedAt" DATETIME,
      result TEXT,
      FOREIGN KEY ("automationId") REFERENCES "Automation"(id)
    )`,
    `CREATE TABLE IF NOT EXISTS "AutomationExecutionLog" (
      id TEXT PRIMARY KEY,
      "executionId" TEXT NOT NULL,
      "nodeId" TEXT NOT NULL,
      status TEXT,
      input TEXT,
      output TEXT,
      "executedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "errorMessage" TEXT,
      FOREIGN KEY ("executionId") REFERENCES "AutomationExecution"(id),
      FOREIGN KEY ("nodeId") REFERENCES "AutomationNode"(id)
    )`,
  ];

  return new Promise<void>((resolve) => {
    let completed = 0;
    tables.forEach((sql) => {
      database.run(sql, () => {
        completed++;
        if (completed === tables.length) resolve();
      });
    });
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
  try {
    const converted = convertSQL(sql, params);

    if (usePostgres) {
      const pool = await getDB();
      const result = await pool.query(converted.sql, converted.params);
      return result.rows;
    } else {
      const database = await getDB();
      return new Promise((resolve, reject) => {
        database.all(converted.sql, converted.params, (err: any, rows: any) => {
          if (err) {
            console.error('[DB.query] Error:', err, 'SQL:', converted.sql);
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      });
    }
  } catch (error) {
    console.error('[DB.query] Exception:', error);
    return [];
  }
}

export async function queryOne(sql: string, params: any[] = []): Promise<any> {
  try {
    const converted = convertSQL(sql, params);

    if (usePostgres) {
      const pool = await getDB();
      const result = await pool.query(converted.sql, converted.params);
      return result.rows[0] || null;
    } else {
      const database = await getDB();
      return new Promise((resolve) => {
        database.get(converted.sql, converted.params, (err: any, row: any) => {
          if (err) {
            console.error('[DB.queryOne] Error:', err);
            resolve(null);
          } else {
            resolve(row || null);
          }
        });
      });
    }
  } catch (error) {
    console.error('[DB.queryOne] Exception:', error);
    return null;
  }
}

export async function run(sql: string, params: any[] = []): Promise<any> {
  try {
    const converted = convertSQL(sql, params);

    if (usePostgres) {
      const pool = await getDB();
      const result = await pool.query(converted.sql, converted.params);
      return { lastID: null, changes: result.rowCount };
    } else {
      const database = await getDB();
      return new Promise((resolve) => {
        // @ts-ignore - sqlite3 callback typing
        database.run(converted.sql, converted.params, function (err: any) {
          if (err) {
            console.error('[DB.run] Error:', err, 'SQL:', converted.sql);
            resolve({ lastID: null, changes: 0 });
            return;
          }
          // @ts-ignore
          resolve({ lastID: this.lastID || null, changes: this.changes || 0 });
        });
      });
    }
  } catch (error) {
    console.error('[DB.run] Exception:', error);
    return { lastID: null, changes: 0 };
  }
}

export async function closeDB() {
  if (usePostgres && db) {
    await db.end();
    db = null;
  } else if (!usePostgres && db) {
    db.close((err: any) => {
      if (err) console.error('DB close error:', err);
    });
    db = null;
  }
}
