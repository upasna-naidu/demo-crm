import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const members = await query(
      `SELECT cu.id, cu."userId", cu.role, cu."joinedAt", u.name, u.email
       FROM "CompanyUser" cu
       LEFT JOIN "User" u ON cu."userId" = u.id
       WHERE cu."companyId" = $1
       ORDER BY cu."joinedAt" DESC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      members,
      count: members.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId, role } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const memberId = `member-${Date.now()}`;

    await run(
      `INSERT INTO "CompanyUser" (id, "userId", "companyId", role, "joinedAt")
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [memberId, userId, id, role || 'member']
    );

    return NextResponse.json({
      success: true,
      message: 'Member added',
      memberId,
    });
  } catch (error) {
    if (String(error).includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'User is already a member of this company' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
