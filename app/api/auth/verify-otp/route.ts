import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { otpStore } from '@/lib/otp-store';

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
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Check if OTP exists and is not expired
    const storedOtp = otpStore[email];
    if (!storedOtp) {
      return NextResponse.json(
        { error: 'OTP expired or not requested. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (storedOtp.expiresAt < Date.now()) {
      delete otpStore[email];
      return NextResponse.json(
        { error: 'OTP expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOtp.code !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP verified, get user from database
    const user = await queryOne(
      `SELECT id, name, email, role FROM User WHERE email = ?`,
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete used OTP
    delete otpStore[email];

    // In production, create a JWT token here
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email, role: user.role })).toString('base64');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('POST /api/auth/verify-otp error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP', details: String(error) },
      { status: 500 }
    );
  }
}
