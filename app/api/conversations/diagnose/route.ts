import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('\n========== DIAGNOSIS ==========\n');

    // 1. Count tables
    const convCount = await query(`SELECT COUNT(*) as cnt FROM "Conversation"`);
    const msgCount = await query(`SELECT COUNT(*) as cnt FROM "ConversationMessage"`);
    const leadCount = await query(`SELECT COUNT(*) as cnt FROM "Lead"`);

    console.log(`Conversations in DB: ${convCount[0]?.cnt || 0}`);
    console.log(`Messages in DB: ${msgCount[0]?.cnt || 0}`);
    console.log(`Leads in DB: ${leadCount[0]?.cnt || 0}`);

    // 2. Get first conversation
    const firstConv = await query(`
      SELECT id, "leadId", channel, status, "lastMessage"
      FROM "Conversation"
      LIMIT 1
    `);

    console.log('\nFirst conversation (raw):');
    console.log(JSON.stringify(firstConv[0], null, 2));

    if (firstConv.length > 0) {
      const convId = firstConv[0].id;
      const leadId = firstConv[0].leadId;

      // 3. Try to fetch with JOIN (same as API does)
      const withJoin = await query(`
        SELECT c.id, c."leadId", c.channel, l.name as "leadName", l.email as "leadEmail"
        FROM "Conversation" c
        JOIN "Lead" l ON c."leadId" = l.id
        WHERE c.id = $1
      `, [convId]);

      console.log('\nWith JOIN result:');
      console.log(JSON.stringify(withJoin, null, 2));

      // 4. Check if lead exists
      const leadCheck = await query(`
        SELECT id, name, email FROM "Lead" WHERE id = $1
      `, [leadId]);

      console.log('\nLead check:');
      console.log(JSON.stringify(leadCheck, null, 2));

      // 5. Get messages for this conversation
      const msgs = await query(`
        SELECT id, "conversationId", message, "senderType"
        FROM "ConversationMessage"
        WHERE "conversationId" = $1
        ORDER BY "createdAt" ASC
      `, [convId]);

      console.log(`\nMessages for conversation: ${msgs.length}`);
      console.log(JSON.stringify(msgs.slice(0, 3), null, 2));
    }

    console.log('\n========== END DIAGNOSIS ==========\n');

    return NextResponse.json({
      success: true,
      stats: {
        conversations: convCount[0]?.cnt || 0,
        messages: msgCount[0]?.cnt || 0,
        leads: leadCount[0]?.cnt || 0,
      },
      sampleConversation: firstConv[0] || null,
    });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
