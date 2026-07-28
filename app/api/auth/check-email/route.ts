import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';

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

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await queryOne(
      `SELECT id, name, email, role FROM User WHERE email = ?`,
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { exists: false, error: 'Please write registered email id' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exists: true,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('POST /api/auth/check-email error:', error);
    return NextResponse.json(
      { error: 'Failed to check email', details: String(error) },
      { status: 500 }
    );
  }
}
