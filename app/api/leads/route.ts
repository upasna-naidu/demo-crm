import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';

function queryDB(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./prisma/dev.db');
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function queryOne(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./prisma/dev.db');
    db.get(sql, params, (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;

    const [leadsData, countData] = await Promise.all([
      queryDB(
        `SELECT l.*, s.name as stageName, u.name as ownerName
         FROM Lead l
         LEFT JOIN Stage s ON l.stageId = s.id
         LEFT JOIN User u ON l.ownerId = u.id
         ORDER BY l.createdAt DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      ),
      queryOne('SELECT COUNT(*) as total FROM Lead'),
    ]);

    const leads = leadsData.map((l: any) => ({
      ...l,
      stage: { name: l.stageName },
      owner: { name: l.ownerName },
    }));

    return NextResponse.json({
      leads,
      total: countData?.total || 0,
      page,
      limit,
      pages: Math.ceil((countData?.total || 0) / limit),
    });
  } catch (error) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads', details: String(error) },
      { status: 500 }
    );
  }
}
