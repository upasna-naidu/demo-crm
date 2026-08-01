import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Create Conversation table
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

    // Create ConversationMessage table
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

    console.log('✅ Conversation tables initialized');

    return NextResponse.json({
      success: true,
      message: 'Conversation tables initialized',
    });
  } catch (error) {
    console.error('Failed to initialize conversation tables:', error);
    return NextResponse.json(
      { error: 'Failed to initialize tables', details: String(error) },
      { status: 500 }
    );
  }
}
