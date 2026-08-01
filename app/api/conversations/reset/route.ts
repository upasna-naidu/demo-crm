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
    console.log('🔄 Starting conversation reset...');

    // Step 1: Clear old data
    console.log('  Step 1: Clearing old data...');
    await run(`DELETE FROM "ConversationMessage"`);
    await run(`DELETE FROM "Conversation"`);

    // Step 2: Get all leads (required for foreign key)
    console.log('  Step 2: Fetching leads...');
    const leads = await query(`SELECT id, name, email FROM "Lead" LIMIT 20`);
    console.log(`  Found ${leads.length} leads`);

    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'No leads found. Run /api/reset-data first.' },
        { status: 400 }
      );
    }

    // Step 3: Create conversations with messages
    console.log('  Step 3: Creating conversations and messages...');
    const channels = ['sms', 'whatsapp', 'voice'];
    let conversationCount = 0;
    let messageCount = 0;

    for (let i = 0; i < leads.length; i++) {
      try {
        const lead = leads[i];
        const channel = channels[i % channels.length];
        const conversationId = `conv-${String(i).padStart(3, '0')}-${Date.now()}`;
        const mockMsgs = mockMessages[channel as keyof typeof mockMessages];

        if (!lead.id) {
          console.error(`  ❌ Lead ${i} has no ID`, lead);
          continue;
        }

        // Create conversation
        const lastMsg = mockMsgs[mockMsgs.length - 1];
        const baseTime = new Date().getTime() - (Math.random() * 7 * 86400000);
        const convTime = new Date(baseTime).toISOString();

        await run(
          `INSERT INTO "Conversation"
           (id, "leadId", channel, status, "isRead", "lastMessage", "lastMessageTime", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            conversationId,
            lead.id,
            channel,
            Math.random() > 0.5 ? 'open' : 'closed',
            0,
            lastMsg.message,
            new Date(baseTime + 300000).toISOString(),
            convTime,
            new Date().toISOString(),
          ]
        );
        conversationCount++;

        // Create messages
        for (let j = 0; j < mockMsgs.length; j++) {
          const msg = mockMsgs[j];
          const msgTime = new Date(baseTime + j * 300000).toISOString();

          await run(
            `INSERT INTO "ConversationMessage"
             (id, "conversationId", "senderType", "senderName", message, "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              `msg-${i}-${j}`,
              conversationId,
              msg.senderType,
              msg.senderName,
              msg.message,
              msgTime,
            ]
          );
          messageCount++;
        }
      } catch (itemError) {
        console.error(`  Error processing lead ${i}:`, itemError);
      }
    }

    console.log(`✅ Reset complete: ${conversationCount} conversations, ${messageCount} messages`);

    return NextResponse.json({
      success: true,
      message: 'Data reset successfully',
      stats: {
        conversationCount,
        messageCount,
        leadsUsed: leads.length,
      },
    });
  } catch (error) {
    console.error('❌ Reset failed:', error);
    return NextResponse.json(
      { error: 'Reset failed', details: String(error) },
      { status: 500 }
    );
  }
}
