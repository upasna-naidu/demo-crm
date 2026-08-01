import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM "EmailTemplate" WHERE 1=1';
    const params: any[] = [];

    if (companyId) {
      sql += ` AND ("companyId" = $${params.length + 1} OR "companyId" IS NULL)`;
      params.push(companyId);
    }

    if (status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    sql += ' ORDER BY "createdAt" DESC';

    const templates = await query(sql, params);
    return NextResponse.json({
      success: true,
      templates: templates || [],
      count: (templates || []).length
    });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, templateType, subject, body, companyId, description, variables } = await request.json();

    if (!name || !subject || !body) {
      return NextResponse.json(
        { error: 'Name, subject, and body are required' },
        { status: 400 }
      );
    }

    const templateId = `template-${Date.now()}`;
    const variablesJson = variables ? JSON.stringify(variables) : null;

    await run(
      `INSERT INTO "EmailTemplate" (id, name, "templateType", subject, body, "companyId", description, status, variables, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [templateId, name, templateType || 'general', subject, body, companyId || null, description || null, 'draft', variablesJson]
    );

    return NextResponse.json({
      success: true,
      templateId,
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json(
      { error: 'Failed to create template', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await run('DELETE FROM "EmailTemplate" WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template', details: String(error) },
      { status: 500 }
    );
  }
}
