import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const ticket = await query('SELECT * FROM "Ticket" WHERE id = ?', [id]);

    if (!ticket || ticket.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const comments = await query(
      'SELECT c.*, u.name as "authorName" FROM "TicketComment" c LEFT JOIN "User" u ON c."authorId" = u.id WHERE c."ticketId" = ? ORDER BY c."createdAt" DESC',
      [id]
    );

    return NextResponse.json({
      success: true,
      ticket: ticket[0],
      comments: comments || []
    });
  } catch (error) {
    console.error('Ticket detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { subject, description, status, priority, category, assignedTo } = await request.json();

    const updates: string[] = [];
    const values: any[] = [];

    if (subject !== undefined) {
      updates.push('subject = ?');
      values.push(subject);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (assignedTo !== undefined) {
      updates.push('"assignedTo" = ?');
      values.push(assignedTo);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push('"updatedAt" = CURRENT_TIMESTAMP');
    values.push(id);

    await run(`UPDATE "Ticket" SET ${updates.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true, message: 'Ticket updated' });
  } catch (error) {
    console.error('Failed to update ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Delete comments first
    await run('DELETE FROM "TicketComment" WHERE "ticketId" = ?', [id]);
    // Delete tags
    await run('DELETE FROM "TicketTag" WHERE "ticketId" = ?', [id]);
    // Delete ticket
    await run('DELETE FROM "Ticket" WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket', details: String(error) },
      { status: 500 }
    );
  }
}
