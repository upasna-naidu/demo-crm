import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { leadId, subject, body, from, to, direction } = await request.json();

    if (!leadId || !subject) {
      return NextResponse.json(
        { error: 'leadId and subject are required' },
        { status: 400 }
      );
    }

    const emailId = `email-${Date.now()}`;
    await run(
      `INSERT INTO "Email" (id, "leadId", subject, body, "from", "to", direction, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [emailId, leadId, subject, body || '', from || '', to || '', direction || 'sent']
    );

    return NextResponse.json({
      success: true,
      id: emailId,
      leadId,
      subject,
      body,
      from,
      to,
      direction,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to save email:', error);
    return NextResponse.json(
      { error: 'Failed to save email', details: String(error) },
      { status: 500 }
    );
  }
}
