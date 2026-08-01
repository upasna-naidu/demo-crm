import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging conversations...');

    // Check how many conversations exist
    const convCount = await query(`SELECT COUNT(*) as count FROM "Conversation"`);
    console.log('Conversations in DB:', convCount[0]?.count || 0);

    // Check how many messages exist
    const msgCount = await query(`SELECT COUNT(*) as count FROM "ConversationMessage"`);
    console.log('Messages in DB:', msgCount[0]?.count || 0);

    // Get sample conversations
    const conversations = await query(`
      SELECT c.id, c."leadId", c.channel, l.name, l.id as "lead_id"
      FROM "Conversation" c
      LEFT JOIN "Lead" l ON c."leadId" = l.id
      LIMIT 5
    `);
    console.log('Sample conversations:', JSON.stringify(conversations, null, 2));

    // Get sample messages
    const messages = await query(`
      SELECT id, "conversationId", message, "createdAt"
      FROM "ConversationMessage"
      LIMIT 5
    `);
    console.log('Sample messages:', JSON.stringify(messages, null, 2));

    return NextResponse.json({
      success: true,
      stats: {
        totalConversations: convCount[0]?.count || 0,
        totalMessages: msgCount[0]?.count || 0,
      },
      sampleConversations: conversations,
      sampleMessages: messages,
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: String(error) },
      { status: 500 }
    );
  }
}
