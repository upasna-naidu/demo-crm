import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let sql = `SELECT t.*, u.name as "assignedToName" FROM "Ticket" t
               LEFT JOIN "User" u ON t."assignedTo" = u.id WHERE 1=1`;
    const params: any[] = [];

    if (status) {
      sql += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority) {
      sql += ` AND t.priority = ?`;
      params.push(priority);
    }

    sql += ` ORDER BY t."createdAt" DESC`;

    const tickets = await query(sql, params);

    return NextResponse.json({
      success: true,
      tickets: tickets || [],
      total: tickets?.length || 0
    });
  } catch (error) {
    console.error('Tickets API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { subject, description, priority, category, customerId } = await request.json();

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    const ticketId = `ticket-${Date.now()}`;
    const countRes = await query('SELECT COUNT(*) as cnt FROM "Ticket"', []);
    const count = countRes?.[0]?.cnt || 0;
    const displayTicketId = `T${String(count + 1).padStart(3, '0')}`;

    await run(
      `INSERT INTO "Ticket" (id, "ticketId", subject, description, priority, category, "customerId", status, "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [ticketId, displayTicketId, subject, description || null, priority || 'medium', category || null, customerId || null, 'open']
    );

    return NextResponse.json({
      success: true,
      ticketId,
      displayTicketId,
      message: 'Ticket created successfully'
    });
  } catch (error) {
    console.error('Failed to create ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket', details: String(error) },
      { status: 500 }
    );
  }
}
