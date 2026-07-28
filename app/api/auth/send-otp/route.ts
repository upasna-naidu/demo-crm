import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { otpStore } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 60 * 1000; // 60 seconds

    // Store OTP
    otpStore[email] = { code: otp, expiresAt };

    // Send OTP via email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'your-email@gmail.com',
          pass: process.env.EMAIL_PASSWORD || 'your-app-password',
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@crm.com',
        to: email,
        subject: 'Your CRM Login OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2>Login Verification</h2>
            <p>Your OTP code is:</p>
            <h1 style="color: #6B2C39; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
            <p>This code will expire in 60 seconds.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">Do not share this code with anyone.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.warn('Email service not configured, OTP available for testing:', otp);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    console.error('POST /api/auth/send-otp error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP', details: String(error) },
      { status: 500 }
    );
  }
}
