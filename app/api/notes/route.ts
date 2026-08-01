import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId is required' },
        { status: 400 }
      );
    }

    const notes = await query(
      `SELECT id, "leadId", title, content, "createdBy", "updatedBy", "createdAt", "updatedAt"
       FROM "Note" WHERE "leadId" = $1 ORDER BY "createdAt" DESC`,
      [leadId]
    );

    return NextResponse.json({
      success: true,
      notes: notes || [],
      count: (notes || []).length
    });
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { leadId, companyId, title, content, createdBy } = await request.json();

    if (!leadId || !content) {
      return NextResponse.json(
        { error: 'leadId and content are required' },
        { status: 400 }
      );
    }

    const noteId = `note-${Date.now()}`;

    await run(
      `INSERT INTO "Note" (id, "leadId", "companyId", title, content, "createdBy", "updatedBy", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [noteId, leadId, companyId || null, title || null, content, createdBy || 'System', createdBy || 'System']
    );

    return NextResponse.json({
      success: true,
      noteId,
      message: 'Note created successfully'
    });
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json(
      { error: 'Failed to create note', details: String(error) },
      { status: 500 }
    );
  }
}
