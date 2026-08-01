import { NextRequest, NextResponse } from 'next/server';
import { run, query } from '@/lib/db';

const mockMessages = {
  sms: [
    { senderType: 'customer', senderName: null, message: 'Hi, is my order ready?' },
    { senderType: 'agent', senderName: 'Sarah', message: 'Yes, it will be shipped tomorrow.' },
    { senderType: 'customer', senderName: null, message: 'Great, thanks!' },
  ],
  whatsapp: [
    { senderType: 'customer', senderName: null, message: 'Can I get a refund?' },
    { senderType: 'agent', senderName: 'John', message: 'Of course! Can you provide your order number?' },
    { senderType: 'customer', senderName: null, message: '#12345' },
    { senderType: 'agent', senderName: 'John', message: 'Processing your refund now. It will take 3-5 business days.' },
  ],
  voice: [
    { senderType: 'customer', senderName: null, message: '[Voice note: Question about product availability]' },
    { senderType: 'agent', senderName: 'Mike', message: '[Voice note: Reply with availability info]' },
  ],
};

export async function GET(request: NextRequest) {
  try {
    // Get all leads
    const leads = await query(`SELECT id, name, email FROM "Lead" LIMIT 20`);

    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'No leads found. Please create leads first.' },
        { status: 400 }
      );
    }

    let conversationCount = 0;
    const channels = ['sms', 'whatsapp', 'voice'];

    // Create mock conversations
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const channel = channels[i % channels.length];
      const conversationId = `conv-${Date.now()}-${i}`;
      const messages = mockMessages[channel as keyof typeof mockMessages];

      // Create conversation
      await run(
        `INSERT INTO "Conversation" (id, "leadId", channel, status, "isRead", "lastMessage", "lastMessageTime", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          conversationId,
          lead.id,
          channel,
          Math.random() > 0.5 ? 'open' : 'closed',
          0,
          messages[messages.length - 1].message,
          new Date(Date.now() - Math.random() * 86400000).toISOString(),
        ]
      );

      // Create messages for conversation with proper timestamps
      const baseTime = new Date(Date.now() - messages.length * 300000).toISOString();
      for (let j = 0; j < messages.length; j++) {
        const msg = messages[j];
        const messageTime = new Date(new Date(baseTime).getTime() + j * 300000).toISOString();
        await run(
          `INSERT INTO "ConversationMessage" (id, "conversationId", "senderType", "senderName", message, "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            `msg-${conversationId}-${j}`,
            conversationId,
            msg.senderType,
            msg.senderName,
            msg.message,
            messageTime,
          ]
        );
      }

      conversationCount++;
    }

    console.log(`✅ Seeded ${conversationCount} mock conversations`);

    return NextResponse.json({
      success: true,
      message: `Created ${conversationCount} mock conversations`,
      conversationCount,
    });
  } catch (error) {
    console.error('Failed to seed conversations:', error);
    return NextResponse.json(
      { error: 'Failed to seed conversations', details: String(error) },
      { status: 500 }
    );
  }
}
