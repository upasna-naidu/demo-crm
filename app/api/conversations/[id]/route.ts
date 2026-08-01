import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

const mockMessages = {
  sms: [
    { id: 'msg-1', conversationId: 'conv-1', senderType: 'customer', senderName: null, message: 'Hi, is my order ready?', createdAt: new Date(Date.now() - 600000).toISOString() },
    { id: 'msg-2', conversationId: 'conv-1', senderType: 'agent', senderName: 'Sarah', message: 'Yes, it will be shipped tomorrow.', createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 'msg-3', conversationId: 'conv-1', senderType: 'customer', senderName: null, message: 'Great, thanks!', createdAt: new Date().toISOString() },
  ],
  whatsapp: [
    { id: 'msg-4', conversationId: 'conv-2', senderType: 'customer', senderName: null, message: 'Can I get a refund?', createdAt: new Date(Date.now() - 900000).toISOString() },
    { id: 'msg-5', conversationId: 'conv-2', senderType: 'agent', senderName: 'John', message: 'Of course! Can you provide your order number?', createdAt: new Date(Date.now() - 600000).toISOString() },
    { id: 'msg-6', conversationId: 'conv-2', senderType: 'customer', senderName: null, message: '#12345', createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 'msg-7', conversationId: 'conv-2', senderType: 'agent', senderName: 'John', message: 'Processing your refund now. It will take 3-5 business days.', createdAt: new Date().toISOString() },
  ],
  voice: [
    { id: 'msg-8', conversationId: 'conv-3', senderType: 'customer', senderName: null, message: '[Voice note: Question about product availability]', createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 'msg-9', conversationId: 'conv-3', senderType: 'agent', senderName: 'Mike', message: '[Voice note: Reply with availability info]', createdAt: new Date().toISOString() },
  ],
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Try database first
    const conversation = await query(
      `SELECT c.id, c."leadId", c.channel, c.status, c."assignedTo", c."isRead",
              c."lastMessage", c."lastMessageTime", c."createdAt",
              l.name as "leadName", l.email as "leadEmail"
       FROM "Conversation" c
       LEFT JOIN "Lead" l ON c."leadId" = l.id WHERE c.id = $1`,
      [id]
    );

    if (conversation.length > 0) {
      const messages = await query(
        `SELECT id, "conversationId", "senderType", "senderName", message, "createdAt"
         FROM "ConversationMessage" WHERE "conversationId" = $1 ORDER BY "createdAt" ASC`,
        [id]
      );
      await run(`UPDATE "Conversation" SET "isRead" = 1 WHERE id = $1`, [id]);
      return NextResponse.json({ success: true, conversation: conversation[0], messages });
    }

    // Fallback: return mock data
    const channel = id.includes('lead-2') ? 'sms' : id.includes('lead-8') ? 'whatsapp' : 'voice';
    const mockMsgs = mockMessages[channel as keyof typeof mockMessages];

    return NextResponse.json({
      success: true,
      conversation: {
        id,
        leadId: 'lead-1',
        leadName: 'Sample Contact',
        leadEmail: 'contact@test.com',
        channel,
        status: 'open',
        assignedTo: null,
        isRead: 1,
        lastMessage: 'Mock message',
        createdAt: new Date().toISOString(),
      },
      messages: mockMsgs,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, assignedTo } = await request.json();
    const updates = [];
    const vals = [];
    let i = 1;

    if (status !== undefined) { updates.push(`status = $${i++}`); vals.push(status); }
    if (assignedTo !== undefined) { updates.push(`"assignedTo" = $${i++}`); vals.push(assignedTo); }
    if (!updates.length) return NextResponse.json({ error: 'No updates' }, { status: 400 });

    vals.push(id);
    await run(`UPDATE "Conversation" SET ${updates.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $${i}`, vals);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
