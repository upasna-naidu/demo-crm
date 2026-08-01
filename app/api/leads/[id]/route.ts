import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query, run } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    // Fetch lead
    const lead = await queryOne(
      `SELECT * FROM "Lead" WHERE id = $1`,
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
      ? await queryOne(`SELECT * FROM "Stage" WHERE id = $1`, [lead.stageId])
      : null;

    // Fetch owner
    const owner = lead.ownerId
      ? await queryOne(`SELECT * FROM "User" WHERE id = $1`, [lead.ownerId])
      : null;

    // Fetch related data (with fallback to empty arrays if tables don't exist)
    let notes = [];
    let emails = [];
    let calls = [];
    let activities = [];
    let paymentLinks = [];

    try {
      notes = await query(
        `SELECT * FROM "Note" WHERE "leadId" = $1 ORDER BY "createdAt" DESC`,
        [leadId]
      );
    } catch (e) {
      console.log('Note table query error (table may not exist):', String(e));
    }

    try {
      emails = await query(
        `SELECT * FROM "Email" WHERE "leadId" = $1 ORDER BY "createdAt" DESC`,
        [leadId]
      );
    } catch (e) {
      console.log('Email table query error (table may not exist):', String(e));
    }

    try {
      calls = await query(
        `SELECT * FROM "CallLog" WHERE "leadId" = $1 ORDER BY "createdAt" DESC`,
        [leadId]
      );
    } catch (e) {
      console.log('CallLog table query error (table may not exist):', String(e));
    }

    try {
      activities = await query(
        `SELECT * FROM "Activity" WHERE "leadId" = $1 ORDER BY "createdAt" DESC`,
        [leadId]
      );
    } catch (e) {
      console.log('Activity table query error (table may not exist):', String(e));
    }

    try {
      paymentLinks = await query(
        `SELECT * FROM "PaymentLink" WHERE "leadId" = $1`,
        [leadId]
      );
    } catch (e) {
      console.log('PaymentLink table query error (table may not exist):', String(e));
    }

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
        createdBy: n.createdBy,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const { email, phone, company, stageId } = await request.json();

    console.log('PUT /api/leads/[id] - leadId:', leadId);
    console.log('Body:', { email, phone, company, stageId });

    if (email) {
      await run(`UPDATE "Lead" SET email = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`, [email, leadId]);
    }
    if (phone) {
      await run(`UPDATE "Lead" SET phone = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`, [phone, leadId]);
    }
    if (company) {
      await run(`UPDATE "Lead" SET company = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`, [company, leadId]);
    }
    if (stageId) {
      await run(`UPDATE "Lead" SET "stageId" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`, [stageId, leadId]);
    }

    console.log('✅ Lead updated successfully');

    return NextResponse.json({ success: true, message: 'Lead updated' });
  } catch (error) {
    console.error('❌ PUT /api/leads/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead', details: String(error) },
      { status: 500 }
    );
  }
}
