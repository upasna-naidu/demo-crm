import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';

function queryOne(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./prisma/dev.db');
    db.get(sql, params, (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function queryDB(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./prisma/dev.db');
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    // Fetch lead
    const lead = await queryOne(
      `SELECT * FROM Lead WHERE id = ?`,
      [leadId]
    );

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Fetch stage
    const stage = lead.stageId
      ? await queryOne(`SELECT * FROM Stage WHERE id = ?`, [lead.stageId])
      : null;

    // Fetch owner
    const owner = lead.ownerId
      ? await queryOne(`SELECT * FROM User WHERE id = ?`, [lead.ownerId])
      : null;

    // Fetch related data
    const [notes, emails, calls, activities, paymentLinks] = await Promise.all([
      queryDB(
        `SELECT n.*, u.name as authorName FROM Note n
         LEFT JOIN User u ON n.authorId = u.id
         WHERE n.leadId = ?
         ORDER BY n.createdAt DESC`,
        [leadId]
      ),
      queryDB(
        `SELECT * FROM Email WHERE leadId = ? ORDER BY createdAt DESC`,
        [leadId]
      ),
      queryDB(
        `SELECT * FROM CallLog WHERE leadId = ? ORDER BY createdAt DESC`,
        [leadId]
      ),
      queryDB(
        `SELECT * FROM Activity WHERE leadId = ? ORDER BY createdAt DESC`,
        [leadId]
      ),
      queryDB(
        `SELECT * FROM PaymentLink WHERE leadId = ?`,
        [leadId]
      ),
    ]);

    // Format the response
    const formattedLead = {
      id: lead.id,
      leadId: lead.leadId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      stageId: lead.stageId,
      stage: stage ? { id: stage.id, name: stage.name } : null,
      source: lead.source,
      utmSource: lead.utmSource,
      utmMedium: lead.utmMedium,
      utmCampaign: lead.utmCampaign,
      utmTerm: lead.utmTerm,
      utmContent: lead.utmContent,
      ownerId: lead.ownerId,
      owner: owner ? { id: owner.id, name: owner.name } : null,
      customFields: lead.customFields,
      dealValue: lead.dealValue,
      notes: notes.map((n: any) => ({
        id: n.id,
        content: n.content,
        createdAt: n.createdAt,
        author: { name: n.authorName },
      })),
      emails: emails.map((e: any) => ({
        id: e.id,
        subject: e.subject,
        body: e.body,
        direction: e.direction,
        createdAt: e.createdAt,
      })),
      calls,
      activities,
      paymentLinks,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };

    return NextResponse.json(formattedLead);
  } catch (error) {
    console.error('GET /api/leads/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead', details: String(error) },
      { status: 500 }
    );
  }
}
