import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  try {
    const { id, memberId } = await params;
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json(
        { error: 'role is required' },
        { status: 400 }
      );
    }

    await run(
      `UPDATE "CompanyUser" SET role = $1 WHERE id = $2 AND "companyId" = $3`,
      [role, memberId, id]
    );

    return NextResponse.json({ success: true, message: 'Member role updated' });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  try {
    const { id, memberId } = await params;

    await run(
      `DELETE FROM "CompanyUser" WHERE id = $1 AND "companyId" = $2`,
      [memberId, id]
    );

    return NextResponse.json({ success: true, message: 'Member removed' });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
