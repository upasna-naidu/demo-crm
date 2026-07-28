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

export async function GET(request: NextRequest) {
  try {
    const stages = await queryDB(
      `SELECT * FROM Stage ORDER BY "order" ASC`
    );

    return NextResponse.json(stages);
  } catch (error) {
    console.error('GET /api/stages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stages', details: String(error) },
      { status: 500 }
    );
  }
}
