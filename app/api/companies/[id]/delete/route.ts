import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Delete related records first
    await run(`DELETE FROM "CompanyUser" WHERE "companyId" = $1`, [id]);
    await run(`DELETE FROM "CompanyProfile" WHERE "companyId" = $1`, [id]);

    // Delete company
    await run(`DELETE FROM "Company" WHERE id = $1`, [id]);

    return NextResponse.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
