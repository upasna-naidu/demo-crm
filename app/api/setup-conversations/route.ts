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
    console.log('\n========== CONVERSATION SETUP ==========');

    // Step 1: Create tables
    console.log('\n[1/4] Creating tables...');
    await run(`
      CREATE TABLE IF NOT EXISTS "Conversation" (
        id TEXT PRIMARY KEY,
        "leadId" TEXT NOT NULL,
        channel TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        "assignedTo" TEXT,
        "isRead" INTEGER DEFAULT 0,
        "lastMessage" TEXT,
        "lastMessageTime" DATETIME,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("leadId") REFERENCES "Lead"(id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS "ConversationMessage" (
        id TEXT PRIMARY KEY,
        "conversationId" TEXT NOT NULL,
        "senderType" TEXT NOT NULL,
        "senderName" TEXT,
        message TEXT NOT NULL,
        "attachmentUrl" TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY("conversationId") REFERENCES "Conversation"(id)
      )
    `);
    console.log('  ✓ Tables created/verified');

    // Step 2: Clear old data
    console.log('\n[2/4] Clearing old data...');
    await run(`DELETE FROM "ConversationMessage"`);
    await run(`DELETE FROM "Conversation"`);
    console.log('  ✓ Old data cleared');

    // Step 3: Get leads
    console.log('\n[3/4] Fetching leads...');
    const leads = await query(`SELECT id, name, email FROM "Lead" LIMIT 20`);
    console.log(`  ✓ Found ${leads.length} leads`);

    if (leads.length === 0) {
      throw new Error('No leads found. Please run /api/reset-data first.');
    }

    // Step 4: Seed conversations
    console.log('\n[4/4] Creating conversations and messages...');
    const channels = ['sms', 'whatsapp', 'voice'];
    let convCreated = 0;
    let msgCreated = 0;

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const channel = channels[i % channels.length];
      // Use lead ID as basis for conversation ID - simple and predictable
      const conversationId = `conv-${lead.id}`;
      const mockMsgs = mockMessages[channel as keyof typeof mockMessages];

      // Calculate timestamps
      const baseTime = Date.now() - Math.random() * 7 * 86400000;
      const conversationTime = new Date(baseTime).toISOString();

      // Insert conversation
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
          mockMsgs[mockMsgs.length - 1].message,
          new Date(baseTime + mockMsgs.length * 300000).toISOString(),
          conversationTime,
          new Date().toISOString(),
        ]
      );
      convCreated++;

      // Insert messages
      for (let j = 0; j < mockMsgs.length; j++) {
        const msg = mockMsgs[j];
        const messageTime = new Date(baseTime + j * 300000).toISOString();

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
            messageTime,
          ]
        );
        msgCreated++;
      }

      if ((i + 1) % 5 === 0) {
        console.log(`  ✓ Seeded ${i + 1}/${leads.length} conversations...`);
      }
    }

    console.log(`  ✓ Created ${convCreated} conversations and ${msgCreated} messages`);

    // Verification
    console.log('\n[Verify] Checking data...');
    const verifyConv = await query(`SELECT COUNT(*) as cnt FROM "Conversation"`);
    const verifyMsg = await query(`SELECT COUNT(*) as cnt FROM "ConversationMessage"`);
    const sampleConv = await query(
      `SELECT c.id, c."leadId", l.name, c.channel FROM "Conversation" c
       JOIN "Lead" l ON c."leadId" = l.id LIMIT 1`
    );

    console.log(`  ✓ Database has ${verifyConv[0]?.cnt || 0} conversations`);
    console.log(`  ✓ Database has ${verifyMsg[0]?.cnt || 0} messages`);
    if (sampleConv.length > 0) {
      console.log(`  ✓ Sample conversation loads correctly with JOIN`);
    }

    console.log('\n========== SETUP COMPLETE ✅ ==========\n');

    return NextResponse.json({
      success: true,
      message: 'Conversations setup complete',
      stats: {
        conversationsCreated: convCreated,
        messagesCreated: msgCreated,
        conversationsInDB: verifyConv[0]?.cnt || 0,
        messagesInDB: verifyMsg[0]?.cnt || 0,
      },
    });
  } catch (error) {
    console.error('\n❌ SETUP FAILED:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Setup failed - check server logs',
      },
      { status: 500 }
    );
  }
}
