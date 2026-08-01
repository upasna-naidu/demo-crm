import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const template = await query('SELECT * FROM "EmailTemplate" WHERE id = $1', [id]);

    if (template.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: template[0]
    });
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, templateType, subject, body, description, status, variables } = await request.json();

    const updates = [];
    const vals = [];
    let i = 1;

    if (name !== undefined) { updates.push(`name = $${i++}`); vals.push(name); }
    if (templateType !== undefined) { updates.push(`"templateType" = $${i++}`); vals.push(templateType); }
    if (subject !== undefined) { updates.push(`subject = $${i++}`); vals.push(subject); }
    if (body !== undefined) { updates.push(`body = $${i++}`); vals.push(body); }
    if (description !== undefined) { updates.push(`description = $${i++}`); vals.push(description); }
    if (status !== undefined) { updates.push(`status = $${i++}`); vals.push(status); }
    if (variables !== undefined) { updates.push(`variables = $${i++}`); vals.push(variables ? JSON.stringify(variables) : null); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    vals.push(id);

    await run(
      `UPDATE "EmailTemplate" SET ${updates.join(', ')} WHERE id = $${i}`,
      vals
    );

    return NextResponse.json({
      success: true,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json(
      { error: 'Failed to update template', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await run('DELETE FROM "EmailTemplate" WHERE id = $1', [id]);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template', details: String(error) },
      { status: 500 }
    );
  }
}
