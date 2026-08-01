import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const note = await query('SELECT * FROM "Note" WHERE id = $1', [id]);

    if (note.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, note: note[0] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { title, content, updatedBy } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const updates = [];
    const vals = [];
    let i = 1;

    if (title !== undefined) { updates.push(`title = $${i++}`); vals.push(title); }
    if (content !== undefined) { updates.push(`content = $${i++}`); vals.push(content); }
    if (updatedBy !== undefined) { updates.push(`"updatedBy" = $${i++}`); vals.push(updatedBy); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    vals.push(id);

    await run(`UPDATE "Note" SET ${updates.join(', ')} WHERE id = $${i}`, vals);

    return NextResponse.json({ success: true, message: 'Note updated' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await run('DELETE FROM "Note" WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
