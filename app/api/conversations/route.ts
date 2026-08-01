import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = `
      SELECT
        c.id,
        c."leadId",
        c.channel,
        c.status,
        c."assignedTo",
        c."isRead",
        c."lastMessage",
        c."lastMessageTime",
        c."createdAt",
        l.name as "leadName",
        l.email as "leadEmail"
      FROM "Conversation" c
      JOIN "Lead" l ON c."leadId" = l.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (channel) {
      sql += ` AND c.channel = $${params.length + 1}`;
      params.push(channel);
    }

    if (status) {
      sql += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (l.name LIKE $${params.length + 1} OR l.email LIKE $${params.length + 1})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY c."lastMessageTime" DESC`;

    const conversations = await query(sql, params);

    return NextResponse.json({
      success: true,
      conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { leadId, channel, lastMessage } = await request.json();

    if (!leadId || !channel) {
      return NextResponse.json(
        { error: 'leadId and channel are required' },
        { status: 400 }
      );
    }

    const conversationId = `conv-${Date.now()}`;
    const timestamp = new Date().toISOString();

    await run(
      `INSERT INTO "Conversation" (id, "leadId", channel, status, "lastMessage", "lastMessageTime", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [conversationId, leadId, channel, 'open', lastMessage || null, timestamp]
    );

    return NextResponse.json({
      success: true,
      conversationId,
      message: 'Conversation created'
    });
  } catch (error) {
    console.error('Failed to create conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation', details: String(error) },
      { status: 500 }
    );
  }
}
