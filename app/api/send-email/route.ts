import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, senderName, senderEmail } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_PASSWORD) {
      console.warn('⚠️ Gmail credentials not configured. Email not sent.');
      console.log('📧 Email would have been sent:');
      console.log(`  From: ${senderName} <${senderEmail}>`);
      console.log(`  To: ${to}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Body: ${body.substring(0, 100)}...`);

      return NextResponse.json({
        success: true,
        message: 'Email logged (Gmail not configured)',
        data: { to, subject, senderEmail, timestamp: new Date().toISOString() },
      });
    }

    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to,
      subject,
      html: body.replace(/\n/g, '<br>'),
      replyTo: senderEmail,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:');
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        to,
        subject,
        messageId: info.messageId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: String(error) },
      { status: 500 }
    );
  }
}
