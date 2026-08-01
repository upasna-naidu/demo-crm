import { NextRequest, NextResponse } from 'next/server';
import { run, query } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { message, senderName } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    const messageId = `msg-${Date.now()}-${Math.random()}`;

    // Insert message
    await run(
      `INSERT INTO "ConversationMessage" (id, "conversationId", "senderType", "senderName", message, "createdAt")
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [messageId, id, 'agent', senderName || 'Agent', message]
    );

    // Update conversation last message
    await run(
      `UPDATE "Conversation" SET "lastMessage" = $1, "lastMessageTime" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`,
      [message, id]
    );

    return NextResponse.json({
      success: true,
      messageId,
      message: 'Message sent',
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: String(error) },
      { status: 500 }
    );
  }
}
